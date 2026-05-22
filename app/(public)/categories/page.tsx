"use client";

import { useRouter } from "next/navigation";
import type { CategoryName } from "@/types";
import { cards, cats, colorVars } from "@/components/data";
import { colorOf, pathForCategory } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const display: Record<CategoryName, number> = {
    "레이어 분리": 680,
    객체지향: 542,
    아키텍처: 431,
    예외처리: 388,
    네이밍: 312,
    테스트: 294
  };

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["카테고리"]]} />
        <PageTitle title="카테고리" sub="전체 미션이 공유하는 추상 카테고리예요." />
        <div className="cat-grid categories-grid">
          {(Object.keys(cats) as CategoryName[]).map((cat) => {
            const [, background] = colorVars[colorOf(cat)];
            const tags = Array.from(
              new Set(cards.filter((card) => card.cat === cat).flatMap((card) => card.tags))
            ).slice(0, 3);
            return (
              <button
                key={cat}
                className="cat-card"
                type="button"
                onClick={() => router.push(pathForCategory(cat))}
              >
                <span className="cat-card-icon" style={{ background }}>
                  {cats[cat].emoji}
                </span>
                <span className="cat-card-name">{cat}</span>
                <span className="cat-card-count">규칙카드 {display[cat].toLocaleString()}개</span>
                <span className="cat-card-tags">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-mini">
                      {tag}
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
