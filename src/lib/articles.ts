import articlesData from "@/data/articles";
import type { Article, ArticleCategory } from "@/types/article";

export function getAllArticles(): Article[] {
  return articlesData.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getFeaturedArticles(): Article[] {
  return getAllArticles().filter((a) => a.isFeatured || a.isPinned);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articlesData.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getArticlesByTag(tag: string): Article[] {
  return getAllArticles().filter((a) =>
    a.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getRelatedArticles(article: Article, limit = 4): Article[] {
  const others = getAllArticles().filter((a) => a.id !== article.id);
  const scored = others.map((a) => {
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

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return getAllArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getHotArticles(limit = 10): Article[] {
  return getAllArticles().slice(0, limit);
}

export function getAllTags(): { name: string; count: number }[] {
  const tagMap = new Map<string, number>();
  for (const article of articlesData) {
    for (const tag of article.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllCategories(): ArticleCategory[] {
  return ["news", "policy", "defi", "ai", "nft", "research"];
}
