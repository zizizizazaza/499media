import {
  getAllArticles,
  getFeaturedArticles,
  getHotArticles,
  getAllTags,
} from "@/lib/articles";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const [allArticles, featured, hotArticles, tags] = await Promise.all([
    getAllArticles(),
    getFeaturedArticles(),
    getHotArticles(),
    getAllTags(),
  ]);

  return (
    <HomeClient
      allArticles={allArticles}
      featured={featured}
      hotArticles={hotArticles}
      tags={tags}
    />
  );
}
