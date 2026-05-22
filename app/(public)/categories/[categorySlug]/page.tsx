"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CategoryName } from "@/types";
import { fetchCards, fetchCategories } from "@/lib/reviewmoa/clientApi";
import type { CategorySummary, ReviewCardListItem } from "@/lib/reviewmoa/types";
import { countBy, countTags, cx, pathForCard, toRuleCard } from "@/utils";
import { CloseIcon } from "@/public/icons";
import { Crumb, FilterGroup, PageTitle, RuleCardItem } from "@/components/common";

export default function Page() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [cards, setCards] = useState<ReviewCardListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const category = categories.find((item) => item.slug === categorySlug);
  const categoryName = category?.name ?? decodeURIComponent(categorySlug);

  const [activeCats, setActiveCats] = useState<CategoryName[]>([categoryName]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    setActiveCats([categoryName]);
  }, [categoryName]);

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchCards({
        category: categorySlug,
        limit: 50
      })
    ])
      .then(([nextCategories, cardResult]) => {
        setCategories(nextCategories);
        setCards(cardResult.items);
        setTotal(cardResult.total);
      })
      .catch((err: Error) => setError(err.message));
  }, [categorySlug]);

  const toggleCat = (cat: CategoryName) =>
    setActiveCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const ruleCards = cards.map(toRuleCard);
  const filteredCards = ruleCards.filter((card) => {
    const catMatch = !activeCats.length || activeCats.includes(card.cat);
    const tagMatch = !activeTags.length || card.tags.some((tag) => activeTags.includes(tag));
    return catMatch && tagMatch;
  });
  const catCounts = countBy(ruleCards, (card) => card.cat);
  const tagCounts = countTags(ruleCards);

  return (
    <div className="view active">
      <div className="page">
        <Crumb
          items={[["홈", () => router.push("/")], ["카테고리", () => router.push("/categories")], [categoryName]]}
        />
        <PageTitle title={categoryName} sub={`${categoryName} 카테고리의 규칙카드예요.`} compact />
        {error ? <div className="empty">카드를 불러오지 못했어요. {error}</div> : null}
        <div className="list-layout">
          <aside className="filter-rail">
            <FilterGroup title="카테고리">
              {Object.entries(catCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  className={cx("chip", activeCats.includes(cat as CategoryName) && "on")}
                  type="button"
                  onClick={() => toggleCat(cat as CategoryName)}
                >
                  <span>{cat}</span>
                  <span className="chip-count">{count}</span>
                </button>
              ))}
            </FilterGroup>
            <FilterGroup title="태그">
              {Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => (
                  <button
                    key={tag}
                    className={cx("chip", activeTags.includes(tag) && "on")}
                    type="button"
                    onClick={() => toggleTag(tag)}
                  >
                    <span>{tag}</span>
                    <span className="chip-count">{count}</span>
                  </button>
                ))}
            </FilterGroup>
          </aside>
          <main className="list-main">
            <div className="list-toolbar">
              <div className="active-filters">
                {activeCats.length || activeTags.length ? (
                  <>
                    {activeCats.map((cat) => (
                      <button key={cat} className="filter-pill" type="button" onClick={() => toggleCat(cat)}>
                        {cat}
                        <CloseIcon />
                      </button>
                    ))}
                    {activeTags.map((tag) => (
                      <button key={tag} className="filter-pill" type="button" onClick={() => toggleTag(tag)}>
                        {tag}
                        <CloseIcon />
                      </button>
                    ))}
                  </>
                ) : (
                  <span className="filter-empty">필터 없음</span>
                )}
              </div>
              <div className="toolbar-right">
                <span className="result-count">{total.toLocaleString()}개</span>
                <select className="sort-select" defaultValue="latest" aria-label="정렬">
                  <option value="latest">최신순</option>
                  <option value="category">카테고리순</option>
                  <option value="conversation">대화 수순</option>
                </select>
              </div>
            </div>
            <div className="card-stack">
              {filteredCards.length ? (
                filteredCards.map((card) => (
                  <RuleCardItem key={card.id} card={card} openCard={(c) => router.push(pathForCard(c.id))} />
                ))
              ) : (
                <div className="empty">
                  <div className="empty-emoji">🔍</div>
                  조건에 맞는 카드가 없어요.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
