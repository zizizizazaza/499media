export type ArticleSource = "ME" | "ChainCatcher" | "PANews" | "499Original";

export type ArticleCategory =
  | "news"
  | "policy"
  | "defi"
  | "ai"
  | "nft"
  | "research";

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
