import type { Mission, ViewName } from "../types";
import { requesters } from "../data";
import { Crumb, PageTitle } from "../common";

export function RequestersView({
  go,
  mission,
  openRequesterCards
}: {
  go: (view: ViewName) => void;
  mission: Mission;
  openRequesterCards: (requester: string) => void;
}) {
  const missionRequesters = requesters[mission.id] ?? [];

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => go("home")], ["미션", () => go("missions")], [mission.name]]} />
        <PageTitle
          title={mission.name}
          sub={`${mission.repo} · 규칙카드 ${mission.cards.toLocaleString()}개 · PR #${mission.prRange}`}
        />
        <div className="sec-head requesters-sec">
          <div className="sec-title">
            PR 요청자 <span className="muted-normal">{missionRequesters.length}명</span>
          </div>
        </div>
        <div className="requester-grid">
          {missionRequesters.map(([id, count, color]) => (
            <button key={id} className="requester-card" type="button" onClick={() => openRequesterCards(id)}>
              <span className="req-avatar" style={{ background: color }}>
                {id.slice(0, 2)}
              </span>
              <span className="req-info">
                <span className="req-id">{id}</span>
                <span className="req-count">규칙카드 {count}개</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
