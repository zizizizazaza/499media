import { getTranslations } from "next-intl/server";
import { getAllCategories } from "@/lib/articles";
import { createArticle } from "../actions";
import ArticleForm from "@/components/admin/ArticleForm";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function NewArticlePage() {
  const t = await getTranslations("admin");
  const categories = await getAllCategories();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToArticles")}
      </Link>

      <h1 className="text-2xl font-bold text-heading mb-6">
        {t("newArticle")}
      </h1>

      <div className="bg-white rounded-xl border border-border p-6">
        <ArticleForm categories={categories} action={createArticle} />
      </div>
    </div>
  );
}
