"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, fetchTagRankings } from "@/lib/reviewmoa/clientApi";
import type { CategorySummary, TagRankItem } from "@/lib/reviewmoa/types";
import { COLOR_VARS, colorOf, pathForCategory } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [topTags, setTopTags] = useState<TagRankItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchTagRankings({ limit: 12 })])
      .then(([nextCategories, nextTopTags]) => {
        setCategories(nextCategories);
        setTopTags(nextTopTags);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["카테고리"]]} />
        <PageTitle title="카테고리" sub="전체 미션이 공유하는 추상 카테고리예요." />
        {error ? <div className="empty">카테고리를 불러오지 못했어요. {error}</div> : null}
        <div className="cat-grid categories-grid">
          {categories.map((category) => {
            const [, background] = COLOR_VARS[category.color] ?? COLOR_VARS[colorOf(category.name)];
            const tags = topTags.slice(0, 3);

            return (
              <button
                key={category.slug}
                className="cat-card"
                type="button"
                onClick={() => router.push(pathForCategory(category.slug))}
              >
                <span className="cat-card-icon" style={{ background }}>
                  {category.emoji}
                </span>
                <span className="cat-card-name">{category.name}</span>
                <span className="cat-card-count">규칙카드 {category.cardCount.toLocaleString()}개</span>
                <span className="cat-card-tags">
                  {tags.map((tag) => (
                    <span key={`${category.slug}-${tag.tagSlug}`} className="tag-mini">
                      {tag.tagName}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
