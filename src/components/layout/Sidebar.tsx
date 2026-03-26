import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/types/article";
import { TrendingUp, Tag } from "lucide-react";

export default function Sidebar({
  hotArticles,
  tags,
}: {
  hotArticles: Article[];
  tags: { name: string; count: number }[];
}) {
  const t = useTranslations("home");

  return (
    <aside className="space-y-8">
      {/* Hot Articles */}
      <div className="bg-surface rounded-xl p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-heading mb-4">
          <TrendingUp className="w-5 h-5 text-brand" />
          {t("hotArticles")}
        </h3>
        <ol className="space-y-3">
          {hotArticles.slice(0, 8).map((article, i) => (
            <li key={article.id}>
              <Link
                href={`/article/${article.slug}`}
                className="flex gap-3 group"
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                    i < 3
                      ? "bg-brand text-white"
                      : "bg-border text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-heading leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {article.title}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {/* Tags */}
      <div className="bg-surface rounded-xl p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-heading mb-4">
          <Tag className="w-5 h-5 text-brand" />
          {t("hotTags")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 15).map((tag) => (
            <Link
              key={tag.name}
              href={`/search?q=${encodeURIComponent(tag.name)}`}
              className="px-3 py-1 text-xs rounded-full bg-white border border-border text-muted hover:text-brand hover:border-brand transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Subscribe CTA */}
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-5">
        <h3 className="text-base font-semibold text-heading mb-2">
          {t("subscribe")}
        </h3>
        <p className="text-sm text-muted mb-4">{t("subscribeCta")}</p>
        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
        >
          Telegram
        </a>
      </div>
    </aside>
  );
}
