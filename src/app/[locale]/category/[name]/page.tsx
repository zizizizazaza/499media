import { getArticlesByCategory, getAllCategories } from "@/lib/articles";
import ArticleCard from "@/components/article/ArticleCard";
import type { ArticleCategory } from "@/types/article";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

const CATEGORY_NAMES: Record<ArticleCategory, { zh: string; en: string }> = {
  news: { zh: "要闻", en: "News" },
  policy: { zh: "政策", en: "Policy" },
  defi: { zh: "DeFi", en: "DeFi" },
  ai: { zh: "AI", en: "AI" },
  nft: { zh: "NFT", en: "NFT" },
  research: { zh: "行研", en: "Research" },
};

type PageProps = {
  params: Promise<{ locale: string; name: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { name, locale } = await params;
  const category = name as ArticleCategory;
  const validCategories = getAllCategories();

  if (!validCategories.includes(category)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">分类不存在</p>
        <Link href="/" className="mt-4 inline-block text-brand hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const articles = getArticlesByCategory(category);
  const categoryName =
    CATEGORY_NAMES[category]?.[locale as "zh" | "en"] || name;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>

      <h1 className="text-2xl font-bold text-heading mb-6">{categoryName}</h1>

      {articles.length > 0 ? (
        <div className="divide-y divide-border">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted">暂无文章</div>
      )}
    </div>
  );
}
