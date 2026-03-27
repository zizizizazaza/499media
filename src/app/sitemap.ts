import type { MetadataRoute } from "next";
import { getAllArticles, getAllCategories } from "@/lib/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://499.media";
  const [articles, categories] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
  ]);
  const locales = ["zh", "en"];

  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/about", priority: 0.5 },
    { path: "/search", priority: 0.4 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${siteUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: page.priority,
      });
    }
  }

  // Article pages
  for (const article of articles) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}/article/${article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "weekly",
        priority: article.isFeatured ? 0.9 : 0.7,
      });
    }
  }

  // Category pages
  for (const cat of categories) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  return entries;
}
