"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CARDS, MISSIONS } from "@/components/data";
import { pathForCard } from "@/utils";
import { Crumb, RuleCardItem } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [randomMission, setRandomMission] = useState("all");
  const [randomCard, setRandomCard] = useState(CARDS[0]);

  const drawRandom = (missionId = randomMission) => {
    const pool = missionId === "all" ? CARDS : CARDS.filter((card) => card.mission === missionId);
    const source = pool.length ? pool : CARDS;
    setRandomCard(source[Math.floor(Math.random() * source.length)]);
  };

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
              {MISSIONS.map((mission) => (
                <option key={mission.id} value={mission.id}>
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
          <RuleCardItem card={randomCard} openCard={(card) => router.push(pathForCard(card.id))} />
          <p>카드를 클릭하면 전체 내용을 볼 수 있어요</p>
        </div>
      </div>
    </div>
  );
}
