import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getArticleById, getAllCategories } from "@/lib/articles";
import { updateArticle } from "../../actions";
import ArticleForm from "@/components/admin/ArticleForm";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("admin");
  const [article, categories] = await Promise.all([
    getArticleById(id),
    getAllCategories(),
  ]);

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, id);

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
        {t("editArticle")}
      </h1>

      <div className="bg-white rounded-xl border border-border p-6">
        <ArticleForm
          article={article as typeof article & { id: string }}
          categories={categories}
          action={boundUpdate}
        />
      </div>
    </div>
  );
}
