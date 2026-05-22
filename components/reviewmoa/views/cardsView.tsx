import type { CategoryName, ListState, RuleCard, ViewName } from "../types";
import { cards } from "../data";
import { countBy, countTags, cx } from "../utils";
import { CloseIcon } from "../icons";
import { Crumb, FilterGroup, PageTitle, RuleCardItem } from "../common";

export function CardsView({
  go,
  listState,
  openMission,
  openCard,
  toggleCat,
  toggleTag
}: {
  go: (view: ViewName) => void;
  listState: ListState;
  openMission: (id: string) => void;
  openCard: (card: RuleCard) => void;
  toggleCat: (cat: CategoryName) => void;
  toggleTag: (tag: string) => void;
}) {
  const requesterPool =
    listState.mode === "requester"
      ? cards.filter((card) => card.requester === listState.requester)
      : cards;
  const basePool =
    listState.mode === "requester"
      ? requesterPool.length
        ? requesterPool
        : cards.filter((card) => card.mission === listState.mission.id)
      : cards;
  const filteredCards = basePool.filter((card) => {
    const catMatch = !listState.activeCats.length || listState.activeCats.includes(card.cat);
    const tagMatch =
      !listState.activeTags.length ||
      card.tags.some((tag) => listState.activeTags.includes(tag));
    return catMatch && tagMatch;
  });
  const catCounts = countBy(basePool, (card) => card.cat);
  const tagCounts = countTags(basePool);
  const title = listState.mode === "requester" ? `@${listState.requester}` : listState.cat;
  const sub =
    listState.mode === "requester"
      ? `${listState.mission.name} 미션에서 받은 규칙카드예요.`
      : `${listState.cat} 카테고리의 규칙카드예요.`;

  return (
    <div className="view active">
      <div className="page">
        {listState.mode === "requester" ? (
          <Crumb
            items={[
              ["홈", () => go("home")],
              ["미션", () => go("missions")],
              [listState.mission.name, () => openMission(listState.mission.id)],
              [`@${listState.requester}`]
            ]}
          />
        ) : (
          <Crumb items={[["홈", () => go("home")], ["카테고리", () => go("categories")], [listState.cat]]} />
        )}
        <PageTitle title={title} sub={sub} compact />
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
                filteredCards.map((card) => <RuleCardItem key={card.id} card={card} openCard={openCard} />)
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
