import { getArticlesByCategory, getAllCategories } from "@/lib/articles";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCategory } from "@/types/article";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string; name: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { name, locale } = await params;
  const tc = await getTranslations("common");
  const category = name as ArticleCategory;
  const categories = await getAllCategories();
  const validSlugs = categories.map((c) => c.slug);

  if (!validSlugs.includes(category)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">{tc("categoryNotFound")}</p>
        <Link href="/" className="mt-4 inline-block text-brand hover:underline">
          {tc("backToHome")}
        </Link>
      </div>
    );
  }

  const articles = await getArticlesByCategory(category);
  const catRow = categories.find((c) => c.slug === category);
  const categoryName =
    locale === "en" ? (catRow?.name_en ?? name) : (catRow?.name_zh ?? name);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {tc("backToHome")}
      </Link>

      <h1 className="text-2xl font-bold text-heading mb-6">{categoryName}</h1>

      {articles.length > 0 ? (
        <div className="divide-y divide-border">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted">{tc("noArticles")}</div>
      )}
    </div>
  );
}
