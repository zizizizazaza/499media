import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { SOURCE_COLORS, SOURCE_LABELS } from "@/types/article";
import ShareToolbar from "@/components/share/ShareToolbar";
import ArticleCard from "@/components/article/ArticleCard";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://499.media";
  const url = `${siteUrl}/${locale}/article/${slug}`;
  const alternateLocale = locale === "zh" ? "en" : "zh";

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: url,
      languages: {
        [alternateLocale]: `${siteUrl}/${alternateLocale}/article/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      images: [{ url: article.coverImage, width: 1200, height: 630 }],
      type: "article",
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [article.coverImage],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug, locale } = await params;
  const article = await getArticleBySlug(slug);
  const tc = await getTranslations("common");
  const ta = await getTranslations("article");

  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(article, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://499.media";
  const articleUrl = `${siteUrl}/${locale}/article/${slug}`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: article.coverImage,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "499",
      url: siteUrl,
    },
    mainEntityOfPage: articleUrl,
    keywords: article.tags.join(", "),
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {tc("backToHome")}
      </Link>

      {/* Article Header */}
      <header>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block px-2.5 py-0.5 text-xs font-medium rounded text-white"
            style={{ backgroundColor: SOURCE_COLORS[article.source] }}
          >
            {SOURCE_LABELS[article.source]}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime} min
          </span>
          <time className="text-sm text-muted">
            {new Date(article.publishedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-heading leading-tight">
          {article.title}
        </h1>

        <p className="mt-4 text-base text-muted leading-relaxed">
          {article.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="px-2.5 py-1 text-xs rounded-full bg-surface text-muted hover:text-brand hover:bg-brand/10 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Author & Source */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted">
            {tc("author")}：{article.author}
          </span>
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
            >
              {tc("originalLink")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative mt-6 aspect-video rounded-xl overflow-hidden bg-surface">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>

      {/* Share toolbar */}
      <div className="mt-6 py-3 border-y border-border">
        <ShareToolbar url={articleUrl} title={article.title} />
      </div>

      {/* Article content */}
      <div className="mt-8 prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Bottom share */}
      <div className="mt-10 py-4 border-t border-border">
        <ShareToolbar url={articleUrl} title={article.title} />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-heading mb-6">{ta("relatedArticles")}</h2>
          <div className="divide-y divide-border">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
