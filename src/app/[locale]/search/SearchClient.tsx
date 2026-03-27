"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import ArticleCard from "@/components/article/ArticleCard";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/types/article";

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

export default function SearchClient({
  initialQuery,
  initialResults,
}: {
  initialQuery: string;
  initialResults: Article[];
}) {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);

  // Debounce: navigate with query param after 500ms of inactivity
  useEffect(() => {
    if (query === initialQuery) return;
    const timer = setTimeout(() => {
      if (query) {
        router.replace(`${pathname}?q=${encodeURIComponent(query)}`);
      } else {
        router.replace(pathname);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, initialQuery, router, pathname]);

  const submit = (value: string) => {
    setQuery(value);
    router.replace(`${pathname}?q=${encodeURIComponent(value)}`);
  };

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
      {!initialQuery && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted mb-3">
            {t("hotKeywords")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {HOT_KEYWORDS.map((kw) => (
              <button
                key={kw}
                onClick={() => submit(kw)}
                className="px-3 py-1.5 text-sm rounded-full bg-surface text-muted hover:text-brand hover:bg-brand/10 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {initialQuery && (
        <div>
          <p className="text-sm text-muted mb-4">
            {t("results")}：{tc("resultCount", { count: initialResults.length })}
          </p>
          {initialResults.length > 0 ? (
            <div className="divide-y divide-border">
              {initialResults.map((article) => (
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
                {tc("backToHome")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
