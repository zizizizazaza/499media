"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Article, CategoryRow } from "@/types/article";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function ArticleForm({
  article,
  categories,
  action,
}: {
  article?: Article & { id: string };
  categories: CategoryRow[];
  action: (formData: FormData) => Promise<void>;
}) {
  const t = useTranslations("admin");
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!article) {
      setSlug(slugify(val));
    }
  };

  return (
    <form action={action} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-heading mb-1">
          {t("articleTitle")} *
        </label>
        <input
          name="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-heading mb-1">
          Slug *
        </label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
          required
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          title="Lowercase letters, numbers, and hyphens only"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading font-mono text-sm"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-heading mb-1">
          {t("summary")} *
        </label>
        <textarea
          name="summary"
          defaultValue={article?.summary ?? ""}
          required
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading resize-y"
        />
      </div>

      {/* Content (Markdown) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-heading">
            {t("content")} * (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-brand hover:underline"
          >
            {showPreview ? t("edit") : t("preview")}
          </button>
        </div>
        {showPreview ? (
          <div className="min-h-[300px] px-4 py-3 rounded-lg border border-border bg-white prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={16}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading font-mono text-sm resize-y"
          />
        )}
        {/* Hidden field to ensure content is submitted when in preview mode */}
        {showPreview && <input type="hidden" name="content" value={content} />}
      </div>

      {/* Two-column grid for metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-heading mb-1">
            {t("category")}
          </label>
          <select
            name="category_id"
            defaultValue={
              categories.find((c) => c.slug === article?.category)?.id ?? ""
            }
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
          >
            <option value="">--</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_zh} / {cat.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-heading mb-1">
            {t("source")}
          </label>
          <select
            name="source"
            defaultValue={article?.source ?? "ME"}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
          >
            <option value="ME">ME News</option>
            <option value="ChainCatcher">ChainCatcher</option>
            <option value="PANews">PANews</option>
            <option value="499Original">499 Original</option>
          </select>
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-heading mb-1">
            {t("author")} *
          </label>
          <input
            name="author"
            defaultValue={article?.author ?? ""}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
          />
        </div>

        {/* Locale */}
        <div>
          <label className="block text-sm font-medium text-heading mb-1">
            {t("locale")}
          </label>
          <select
            name="locale"
            defaultValue={article?.locale ?? "zh"}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Reading time */}
        <div>
          <label className="block text-sm font-medium text-heading mb-1">
            {t("readingTime")} (min)
          </label>
          <input
            name="reading_time"
            type="number"
            min={1}
            defaultValue={article?.readingTime ?? 5}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
          />
        </div>

        {/* Source URL */}
        <div>
          <label className="block text-sm font-medium text-heading mb-1">
            {t("sourceUrl")}
          </label>
          <input
            name="source_url"
            type="url"
            defaultValue={article?.sourceUrl ?? ""}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
          />
        </div>
      </div>

      {/* Cover image URL */}
      <div>
        <label className="block text-sm font-medium text-heading mb-1">
          {t("coverImage")} (URL)
        </label>
        <input
          name="cover_image"
          defaultValue={article?.coverImage ?? ""}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-heading mb-1">
          {t("tags")} ({t("commaSeparated")})
        </label>
        <input
          name="tags"
          defaultValue={article?.tags?.join(", ") ?? ""}
          placeholder="Bitcoin, DeFi, AI"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-heading"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-heading">
          <input
            name="is_featured"
            type="checkbox"
            defaultChecked={article?.isFeatured ?? false}
            className="rounded border-border"
          />
          {t("featured")}
        </label>
        <label className="flex items-center gap-2 text-sm text-heading">
          <input
            name="is_pinned"
            type="checkbox"
            defaultChecked={article?.isPinned ?? false}
            className="rounded border-border"
          />
          {t("pinned")}
        </label>
      </div>

      {/* Submit buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          name="status"
          value="published"
          className="px-6 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
        >
          {t("publish")}
        </button>
        <button
          type="submit"
          name="status"
          value="draft"
          className="px-6 py-2.5 text-sm font-medium text-muted border border-border rounded-lg hover:bg-surface transition-colors"
        >
          {t("saveDraft")}
        </button>
      </div>
    </form>
  );
}
