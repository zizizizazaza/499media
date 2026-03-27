/**
 * Seed script: imports articles from src/data/articles.ts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load env from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

// Service role client bypasses RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Category slug → name mapping
const CATEGORIES = [
  { slug: "news", name_zh: "要闻", name_en: "News", sort_order: 1 },
  { slug: "policy", name_zh: "政策", name_en: "Policy", sort_order: 2 },
  { slug: "defi", name_zh: "DeFi", name_en: "DeFi", sort_order: 3 },
  { slug: "ai", name_zh: "AI", name_en: "AI", sort_order: 4 },
  { slug: "nft", name_zh: "NFT", name_en: "NFT", sort_order: 5 },
  { slug: "research", name_zh: "行研", name_en: "Research", sort_order: 6 },
];

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Upsert categories
  console.log("📁 Seeding categories...");
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .upsert(CATEGORIES, { onConflict: "slug" })
    .select();

  if (catError) {
    console.error("Failed to seed categories:", catError);
    process.exit(1);
  }
  console.log(`   ✓ ${categories.length} categories`);

  // Build lookup: category slug → id
  const catMap = new Map<string, string>();
  for (const cat of categories) {
    catMap.set(cat.slug, cat.id);
  }

  // 2. Import articles data (dynamic import for TS compatibility)
  const { default: articlesData } = await import("../src/data/articles");

  // 3. Collect unique tags
  const uniqueTags = new Set<string>();
  for (const a of articlesData) {
    for (const tag of a.tags) {
      uniqueTags.add(tag);
    }
  }

  // 4. Upsert tags
  console.log("🏷️  Seeding tags...");
  const tagInserts = Array.from(uniqueTags).map((name) => ({ name }));
  const { data: tags, error: tagError } = await supabase
    .from("tags")
    .upsert(tagInserts, { onConflict: "name" })
    .select();

  if (tagError) {
    console.error("Failed to seed tags:", tagError);
    process.exit(1);
  }
  console.log(`   ✓ ${tags.length} tags`);

  // Build lookup: tag name → id
  const tagMap = new Map<string, string>();
  for (const tag of tags) {
    tagMap.set(tag.name, tag.id);
  }

  // 5. Insert articles
  console.log("📰 Seeding articles...");
  for (const article of articlesData) {
    const categoryId = catMap.get(article.category);

    const { data: inserted, error: artError } = await supabase
      .from("articles")
      .upsert(
        {
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          content: article.content,
          cover_image: article.coverImage,
          author: article.author,
          source: article.source,
          source_url: article.sourceUrl,
          category_id: categoryId ?? null,
          locale: article.locale,
          is_featured: article.isFeatured,
          is_pinned: article.isPinned,
          reading_time: article.readingTime,
          status: "published",
          published_at: article.publishedAt,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (artError) {
      console.error(`   ✗ Failed: ${article.slug}`, artError.message);
      continue;
    }

    // 6. Link tags
    const articleTagLinks = article.tags
      .map((tagName) => {
        const tagId = tagMap.get(tagName);
        return tagId ? { article_id: inserted.id, tag_id: tagId } : null;
      })
      .filter(Boolean);

    if (articleTagLinks.length > 0) {
      await supabase.from("article_tags").upsert(articleTagLinks as Array<{ article_id: string; tag_id: string }>, {
        onConflict: "article_id,tag_id",
      });
    }

    console.log(`   ✓ ${article.slug}`);
  }

  console.log(`\n✅ Seed complete! ${articlesData.length} articles imported.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
