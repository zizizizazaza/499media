import { createClient } from "@/lib/supabase/server";
import type { Article, ArticleCategory, CategoryRow } from "@/types/article";

/**
 * Transform a Supabase article row (with joined category + tags) into
 * the frontend Article shape that all components expect.
 */
function toArticle(row: Record<string, unknown>): Article {
  const cat = row.categories as Record<string, string> | null;
  const tagRows = row.article_tags as Array<{ tags: { name: string } }> | undefined;

  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    content: row.content as string,
    coverImage: (row.cover_image as string) ?? "/images/covers/fear-greed-index-drops-to-10.png",
    author: row.author as string,
    source: (row.source as Article["source"]) ?? "ME",
    sourceUrl: (row.source_url as string) ?? "",
    category: (cat?.slug as ArticleCategory) ?? "news",
    tags: tagRows?.map((at) => at.tags.name) ?? [],
    publishedAt: (row.published_at as string) ?? (row.created_at as string),
    locale: (row.locale as "zh" | "en") ?? "zh",
    isFeatured: (row.is_featured as boolean) ?? false,
    isPinned: (row.is_pinned as boolean) ?? false,
    readingTime: (row.reading_time as number) ?? 1,
    status: (row.status as Article["status"]) ?? "published",
  };
}

const ARTICLE_SELECT = `
  *,
  categories ( slug, name_zh, name_en ),
  article_tags ( tags ( name ) )
`;

export async function getAllArticles(
  locale?: string,
  page = 1,
  limit = 50
): Promise<Article[]> {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (locale) query = query.eq("locale", locale);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toArticle);
}

export async function getFeaturedArticles(locale?: string): Promise<Article[]> {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .or("is_featured.eq.true,is_pinned.eq.true")
    .order("published_at", { ascending: false });

  if (locale) query = query.eq("locale", locale);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? toArticle(data) : undefined;
}

export async function getArticlesByCategory(
  category: ArticleCategory,
  locale?: string,
  page = 1,
  limit = 50
): Promise<Article[]> {
  const supabase = await createClient();

  // First get the category id
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();

  if (!cat) return [];

  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .eq("category_id", cat.id)
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (locale) query = query.eq("locale", locale);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toArticle);
}

export async function getArticlesByTag(
  tag: string,
  locale?: string
): Promise<Article[]> {
  const supabase = await createClient();

  // Get tag id
  const { data: tagRow } = await supabase
    .from("tags")
    .select("id")
    .ilike("name", tag)
    .single();

  if (!tagRow) return [];

  // Get article IDs through junction table
  const { data: junctions } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tagRow.id);

  if (!junctions || junctions.length === 0) return [];

  const articleIds = junctions.map((j) => j.article_id);
  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .in("id", articleIds)
    .order("published_at", { ascending: false });

  if (locale) query = query.eq("locale", locale);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toArticle);
}

export async function getRelatedArticles(
  article: Article,
  limit = 4
): Promise<Article[]> {
  // Get all published articles in same category, then score by shared tags
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  if (!data) return [];

  const articles = data.map(toArticle);
  const scored = articles.map((a) => {
    let score = 0;
    if (a.category === article.category) score += 3;
    for (const tag of a.tags) {
      if (article.tags.includes(tag)) score += 2;
    }
    return { article: a, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.article);
}

export async function searchArticles(
  query: string,
  locale?: string
): Promise<Article[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();

  // Try full-text search first, then fall back to ILIKE for CJK
  const tsQuery = query.trim().split(/\s+/).join(" & ");
  let dbQuery = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .or(`search_vector.fts(simple).${tsQuery},title.ilike.%${query}%,summary.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(50);

  if (locale) dbQuery = dbQuery.eq("locale", locale);

  const { data, error } = await dbQuery;
  if (error) throw error;
  return (data ?? []).map(toArticle);
}

export async function getHotArticles(
  locale?: string,
  limit = 10
): Promise<Article[]> {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (locale) query = query.eq("locale", locale);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toArticle);
}

export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_tags")
    .select("tag_id, tags ( name )");

  if (error) throw error;
  if (!data) return [];

  const tagMap = new Map<string, number>();
  for (const row of data) {
    const name = (row.tags as unknown as { name: string })?.name;
    if (name) tagMap.set(name, (tagMap.get(name) || 0) + 1);
  }
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAllCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

// ============================================================================
// Admin-only functions (used by Server Actions)
// ============================================================================

export async function getArticleById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? toArticle(data) : undefined;
}

export async function getAdminArticles(
  status?: string,
  page = 1,
  limit = 20
) {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    articles: (data ?? []).map(toArticle),
    total: count ?? 0,
  };
}
