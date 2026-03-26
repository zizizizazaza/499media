import Image from "next/image";
import type { Article } from "@/types/article";
import { SOURCE_COLORS, SOURCE_LABELS } from "@/types/article";
import { Link } from "@/i18n/navigation";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex gap-4 p-4 rounded-xl hover:bg-surface transition-colors"
    >
      <div className="relative w-[200px] h-[130px] flex-shrink-0 rounded-lg overflow-hidden bg-surface">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="200px"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-base font-semibold text-heading line-clamp-2 group-hover:text-brand transition-colors">
            {article.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted line-clamp-2">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span
            className="inline-block px-2 py-0.5 text-xs font-medium rounded text-white"
            style={{ backgroundColor: SOURCE_COLORS[article.source] }}
          >
            {SOURCE_LABELS[article.source]}
          </span>
          <span className="text-xs text-muted">
            {formatTime(article.publishedAt)}
          </span>
          <span className="text-xs text-muted">
            {article.readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours} 小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}
