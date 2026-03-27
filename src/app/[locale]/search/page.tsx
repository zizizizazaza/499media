import { searchArticles } from "@/lib/articles";
import SearchClient from "./SearchClient";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  let results: Awaited<ReturnType<typeof searchArticles>> = [];
  try {
    if (query) results = await searchArticles(query);
  } catch {
    results = [];
  }

  return <SearchClient initialQuery={query} initialResults={results} />;
}
