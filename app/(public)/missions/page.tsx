"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Mission } from "@/types";
import { MISSIONS } from "@/components/data";
import { pathForMission } from "@/utils";
import { Crumb, MissionStat, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const grouped = useMemo(
    () =>
      MISSIONS.reduce<Record<number, Mission[]>>((acc, mission) => {
        acc[mission.level] = [...(acc[mission.level] ?? []), mission];
        return acc;
      }, {}),
    []
  );

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["미션"]]} />
        <PageTitle title="미션" sub="미션을 선택하면 PR 요청자 목록을 볼 수 있어요." />
        <div className="missions-list">
          {Object.entries(grouped).map(([level, items]) => (
            <section key={level} className="level-block">
              <div className="level-tag">레벨 {level}</div>
              <div className="mission-grid">
                {items.map((mission) => (
                  <button
                    key={mission.id}
                    className="mission-card"
                    type="button"
                    onClick={() => router.push(pathForMission(mission.id))}
                  >
                    <span className="mission-card-head">
                      <span>
                        <span className="mission-repo">{mission.repo}</span>
                        <span className="mission-title">{mission.name}</span>
                      </span>
                    </span>
                    <span className="mission-tags">
                      {mission.tags.map((tag) => (
                        <span key={tag} className="tag-mini">
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="mission-card-stats">
                      <MissionStat value={mission.cards.toLocaleString()} label="규칙카드" />
                      <MissionStat value={String(mission.requesters)} label="요청자" />
                      <MissionStat value={`#${mission.prRange}`} label="PR 범위" mono />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
