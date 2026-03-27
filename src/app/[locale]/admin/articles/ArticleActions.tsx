"use client";

import { Link } from "@/i18n/navigation";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteArticle, changeStatus } from "./actions";

export default function ArticleActions({
  articleId,
  status,
}: {
  articleId: string;
  status: string;
}) {
  const tc = useTranslations("common");

  return (
    <div className="flex items-center justify-end gap-1">
      {status === "draft" && (
        <button
          onClick={() => changeStatus(articleId, "published")}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-medium"
          title="Publish"
        >
          {tc("publish")}
        </button>
      )}
      {status === "published" && (
        <button
          onClick={() => changeStatus(articleId, "draft")}
          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors text-xs font-medium"
          title="Unpublish"
        >
          {tc("unpublish")}
        </button>
      )}
      <Link
        href={`/admin/articles/${articleId}/edit`}
        className="p-1.5 text-muted hover:text-brand hover:bg-surface rounded-lg transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={async () => {
          if (confirm(tc("confirmDelete"))) {
            try {
              await deleteArticle(articleId);
            } catch {
              // Error is thrown by server action, page will show error
            }
          }
        }}
        className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
