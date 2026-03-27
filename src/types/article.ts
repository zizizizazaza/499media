export type ArticleSource = "ME" | "ChainCatcher" | "PANews" | "499Original";

export type ArticleCategory =
  | "news"
  | "policy"
  | "defi"
  | "ai"
  | "nft"
  | "research";

export type ArticleStatus = "draft" | "published" | "archived";

/** Row shape returned from Supabase, with joined category & tags */
export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  source: ArticleSource;
  sourceUrl: string;
  category: ArticleCategory;
  tags: string[];
  publishedAt: string;
  locale: "zh" | "en";
  isFeatured: boolean;
  isPinned: boolean;
  readingTime: number;
  status?: ArticleStatus;
}

/** Database row shape (snake_case) as stored in Supabase */
export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image: string | null;
  author: string;
  source: ArticleSource | null;
  source_url: string | null;
  category_id: string | null;
  locale: "zh" | "en";
  is_featured: boolean;
  is_pinned: boolean;
  reading_time: number;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  slug: ArticleCategory;
  name_zh: string;
  name_en: string;
  sort_order: number;
  created_at: string;
}

export interface TagRow {
  id: string;
  name: string;
  created_at: string;
}

export const SOURCE_COLORS: Record<ArticleSource, string> = {
  ME: "#FF6B35",
  ChainCatcher: "#3B82F6",
  PANews: "#10B981",
  "499Original": "#6C63FF",
};

export const SOURCE_LABELS: Record<ArticleSource, string> = {
  ME: "ME News",
  ChainCatcher: "ChainCatcher",
  PANews: "PANews",
  "499Original": "499 原创",
};
