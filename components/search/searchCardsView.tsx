"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCards } from "@/lib/reviewmoa/clientApi";
import type { ReviewCardListItem } from "@/lib/reviewmoa/types";
import { pathForCard, toRuleCard } from "@/utils";
import { SearchIcon } from "@/public/icons";
import { Crumb, PageTitle, RuleCardItem } from "@/components/common";

interface SearchCardsViewProps {
  initialQuery: string;
}

export function SearchCardsView({ initialQuery }: SearchCardsViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery.trim());
  const [cards, setCards] = useState<ReviewCardListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextQuery = initialQuery.trim();
    setQuery(initialQuery);
    setSubmittedQuery(nextQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!submittedQuery) {
      setCards([]);
      setTotal(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    fetchCards({
      q: submittedQuery,
      limit: 30
    })
      .then((result) => {
        setCards(result.items);
        setTotal(result.total);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [submittedQuery]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();
    setSubmittedQuery(nextQuery);
    router.replace(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
  };

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["검색"]]} />
        <PageTitle title="검색" sub="카드 제목, 요약, 카테고리, 미션, 요청자 기준으로 검색해요." />
        <form className="search-form" role="search" onSubmit={submitSearch}>
          <SearchIcon />
          <input
            aria-label="검색어"
            className="search-input"
            placeholder="검색어를 입력하세요"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="search-submit" type="submit">
            검색
          </button>
        </form>
        <div className="search-toolbar">
          <span className="result-count">
            {submittedQuery ? `"${submittedQuery}" 검색 결과 ${total.toLocaleString()}개` : "검색어를 입력해 주세요"}
          </span>
        </div>
        {error ? <div className="empty">검색 결과를 불러오지 못했어요. {error}</div> : null}
        <div className="card-stack">
          {cards.map((card) => {
            const ruleCard = toRuleCard(card);

            return (
              <RuleCardItem
                key={card.id}
                card={ruleCard}
                openCard={(item) => router.push(pathForCard(item.id))}
              />
            );
          })}
          {!isLoading && submittedQuery && cards.length === 0 && !error ? (
            <div className="empty">
              <div className="empty-emoji">🔍</div>
              조건에 맞는 카드가 없어요.
            </div>
          ) : null}
          {isLoading ? <div className="empty">검색 중이에요.</div> : null}
        </div>
      </div>
    </div>
  );
}
