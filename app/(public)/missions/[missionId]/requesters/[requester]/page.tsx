"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryName, ListState } from "@/components/types";
import { cards, missions } from "@/components/data";
import { countBy, countTags, cx, pathForCard, pathForMission } from "@/components/utils";
import { CloseIcon } from "@/public/icons";
import { Crumb, FilterGroup, PageTitle, RuleCardItem } from "@/components/common";

export default function Page({
  params
}: {
  params: Promise<{ missionId: string; requester: string }>;
}) {
  const { missionId, requester: encodedRequester } = use(params);
  const requester = decodeURIComponent(encodedRequester);
  const router = useRouter();
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];

  const [listState, setListState] = useState<ListState>({
    mode: "requester",
    mission,
    requester,
    activeCats: [],
    activeTags: []
  });

  const toggleCat = (cat: CategoryName) => {
    setListState((current) => ({
      ...current,
      activeCats: current.activeCats.includes(cat)
        ? current.activeCats.filter((item) => item !== cat)
        : [...current.activeCats, cat]
    }));
  };

  const toggleTag = (tag: string) => {
    setListState((current) => ({
      ...current,
      activeTags: current.activeTags.includes(tag)
        ? current.activeTags.filter((item) => item !== tag)
        : [...current.activeTags, tag]
    }));
  };

  const requesterPool = cards.filter((card) => card.requester === requester);
  const basePool = requesterPool.length ? requesterPool : cards.filter((card) => card.mission === mission.id);
  const filteredCards = basePool.filter((card) => {
    const catMatch = !listState.activeCats.length || listState.activeCats.includes(card.cat);
    const tagMatch = !listState.activeTags.length || card.tags.some((tag) => listState.activeTags.includes(tag));
    return catMatch && tagMatch;
  });
  const catCounts = countBy(basePool, (card) => card.cat);
  const tagCounts = countTags(basePool);

  return (
    <div className="view active">
      <div className="page">
        <Crumb
          items={[
            ["홈", () => router.push("/")],
            ["미션", () => router.push("/missions")],
            [mission.name, () => router.push(pathForMission(mission.id))],
            [`@${requester}`]
          ]}
        />
        <PageTitle title={`@${requester}`} sub={`${mission.name} 미션에서 받은 규칙카드예요.`} compact />
        <div className="list-layout">
          <aside className="filter-rail">
            <FilterGroup title="카테고리">
              {Object.entries(catCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  className={cx("chip", listState.activeCats.includes(cat as CategoryName) && "on")}
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
                    className={cx("chip", listState.activeTags.includes(tag) && "on")}
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
                {listState.activeCats.length || listState.activeTags.length ? (
                  <>
                    {listState.activeCats.map((cat) => (
                      <button key={cat} className="filter-pill" type="button" onClick={() => toggleCat(cat)}>
                        {cat}
                        <CloseIcon />
                      </button>
                    ))}
                    {listState.activeTags.map((tag) => (
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
                <span className="result-count">{filteredCards.length}개</span>
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
