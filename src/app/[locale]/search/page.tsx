"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { searchArticles } from "@/lib/articles";
import ArticleCard from "@/components/article/ArticleCard";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

const HOT_KEYWORDS = [
  "Bitcoin",
  "DeFi",
  "AI",
  "稳定币",
  "ETF",
  "监管",
  "NFT",
  "以太坊",
  "Solana",
  "a16z",
];

export default function SearchPage() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = debouncedQuery ? searchArticles(debouncedQuery) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-heading mb-6">{t("title")}</h1>

      {/* Search input */}
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading placeholder:text-muted transition-colors"
          autoFocus
        />
      </div>

      {/* Hot keywords */}
      {!debouncedQuery && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted mb-3">
            {t("hotKeywords")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {HOT_KEYWORDS.map((kw) => (
              <button
                key={kw}
                onClick={() => setQuery(kw)}
                className="px-3 py-1.5 text-sm rounded-full bg-surface text-muted hover:text-brand hover:bg-brand/10 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {debouncedQuery && (
        <div>
          <p className="text-sm text-muted mb-4">
            {t("results")}：{results.length} 篇
          </p>
          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted">{t("noResults")}</p>
              <Link
                href="/"
                className="mt-4 inline-block text-brand hover:underline"
              >
                返回首页
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
