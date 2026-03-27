"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Article } from "@/types/article";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSection({ articles }: { articles: Article[] }) {
  const [current, setCurrent] = useState(0);
  const tc = useTranslations("common");

  if (articles.length === 0) return null;

  const article = articles[current];

  const prev = () =>
    setCurrent((c) => (c === 0 ? articles.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === articles.length - 1 ? 0 : c + 1));

  return (
    <section className="relative rounded-2xl overflow-hidden bg-heading group">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="relative aspect-[21/9] md:aspect-[3/1]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover opacity-60"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-brand text-white mb-3">
              {tc("featured")}
            </span>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
              {article.title}
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-300 line-clamp-2 max-w-2xl">
              {article.summary}
            </p>
          </div>
        </div>
      </Link>

      {articles.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-3 right-6 md:right-10 flex gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrent(i);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-brand" : "bg-white/40"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
