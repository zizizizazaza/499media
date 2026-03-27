import { getAdminArticles } from "@/lib/articles";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import ArticleActions from "./ArticleActions";

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin");
  const params = await searchParams;
  const status = params.status ?? undefined;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 20;

  const { articles, total } = await getAdminArticles(status, page, limit);
  const totalPages = Math.ceil(total / limit);

  const statusFilters = [
    { label: t("all"), value: undefined },
    { label: t("published"), value: "published" },
    { label: t("drafts"), value: "draft" },
    { label: t("archived"), value: "archived" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-heading">
          {t("articles")}
        </h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("newArticle")}
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-4">
        {statusFilters.map((f) => (
          <Link
            key={f.value ?? "all"}
            href={
              f.value
                ? `/admin/articles?status=${f.value}`
                : "/admin/articles"
            }
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              status === f.value
                ? "bg-brand text-white"
                : "bg-surface text-muted hover:bg-border"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">
                {t("articleTitle")}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase hidden md:table-cell">
                {t("status")}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase hidden lg:table-cell">
                {t("category")}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase hidden lg:table-cell">
                {t("date")}
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-surface/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {article.isFeatured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                        ★
                      </span>
                    )}
                    <span className="text-sm font-medium text-heading line-clamp-1">
                      {article.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <StatusBadge status={article.status ?? "draft"} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted">{article.category}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted">
                    {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ArticleActions articleId={article.id} status={article.status ?? "draft"} />
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted text-sm"
                >
                  {t("noArticles")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/articles?${status ? `status=${status}&` : ""}page=${p}`}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                p === page
                  ? "bg-brand text-white"
                  : "bg-surface text-muted hover:bg-border"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] ?? styles.draft}`}
    >
      {status}
    </span>
  );
}
