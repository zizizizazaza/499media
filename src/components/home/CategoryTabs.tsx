"use client";

import { useTranslations } from "next-intl";
import type { ArticleCategory } from "@/types/article";

const categories: { key: string; value: ArticleCategory | "all" }[] = [
  { key: "all", value: "all" },
  { key: "news", value: "news" },
  { key: "policy", value: "policy" },
  { key: "defi", value: "defi" },
  { key: "ai", value: "ai" },
  { key: "nft", value: "nft" },
  { key: "research", value: "research" },
];

export default function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("home");

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(({ key, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === value
              ? "bg-brand text-white"
              : "bg-surface text-muted hover:bg-border"
          }`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
