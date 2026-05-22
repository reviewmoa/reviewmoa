"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMissions, fetchRandomCard } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary, ReviewCardListItem } from "@/lib/reviewmoa/types";
import { pathForCard, toRuleCard } from "@/utils";
import { Crumb, RuleCardItem } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [randomMission, setRandomMission] = useState("all");
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [randomCard, setRandomCard] = useState<ReviewCardListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drawRandom = useCallback((missionId = randomMission) => {
    fetchRandomCard({
      mission: missionId === "all" ? undefined : missionId
    })
      .then(setRandomCard)
      .catch((err: Error) => setError(err.message));
  }, [randomMission]);

  useEffect(() => {
    fetchMissions().then(setMissions).catch((err: Error) => setError(err.message));
    fetchRandomCard().then(setRandomCard).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="view active">
      <div className="page page-narrow">
        <Crumb items={[["홈", () => router.push("/")], ["랜덤 카드"]]} />
        <div className="random-head">
          <h1>랜덤 규칙카드</h1>
          <p>미션을 고르고 카드를 한 장 뽑아보세요.</p>
          <div className="random-controls">
            <select
              className="sort-select random-select"
              value={randomMission}
              onChange={(event) => {
                setRandomMission(event.target.value);
                drawRandom(event.target.value);
              }}
              aria-label="랜덤 카드 미션"
            >
              <option value="all">전체 미션</option>
              {missions.map((mission) => (
                <option key={mission.slug} value={mission.slug}>
                  {mission.name}
                </option>
              ))}
            </select>
            <button className="btn-primary" type="button" onClick={() => drawRandom()}>
              🎲 카드 뽑기
            </button>
          </div>
        </div>
        <div className="random-card-area">
          {error ? <div className="empty">랜덤 카드를 불러오지 못했어요. {error}</div> : null}
          {randomCard ? (
            <RuleCardItem card={toRuleCard(randomCard)} openCard={(card) => router.push(pathForCard(card.id))} />
          ) : (
            <div className="empty">카드를 불러오고 있어요.</div>
          )}
          <p>카드를 클릭하면 전체 내용을 볼 수 있어요</p>
        </div>
      </div>
    </div>
  );
}
