"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import HeroSection from "@/components/home/HeroSection";
import CategoryTabs from "@/components/home/CategoryTabs";
import ArticleCard from "@/components/article/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import type { Article, ArticleCategory } from "@/types/article";

export default function HomeClient({
  allArticles,
  featured,
  hotArticles,
  tags,
}: {
  allArticles: Article[];
  featured: Article[];
  hotArticles: Article[];
  tags: { name: string; count: number }[];
}) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredArticles =
    activeCategory === "all"
      ? allArticles
      : allArticles.filter(
          (a) => a.category === (activeCategory as ArticleCategory)
        );

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <HeroSection articles={featured.slice(0, 3)} />

      {/* Category Tabs */}
      <div className="mt-8">
        <CategoryTabs
          active={activeCategory}
          onChange={(val) => {
            setActiveCategory(val);
            setVisibleCount(8);
          }}
        />
      </div>

      {/* Main Content + Sidebar */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Article List */}
        <div>
          <div className="divide-y divide-border">
            {visibleArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {visibleCount < filteredArticles.length && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + 8)}
                className="px-6 py-2.5 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand hover:text-white transition-colors"
              >
                {t("loadMore")}
              </button>
            </div>
          )}

          {filteredArticles.length === 0 && (
            <div className="py-20 text-center text-muted">
              {tc("noArticlesInCategory")}
            </div>
          )}
        </div>

        {/* Sidebar - desktop only */}
        <div className="hidden lg:block">
          <Sidebar hotArticles={hotArticles} tags={tags} />
        </div>
      </div>
    </div>
  );
}
