"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMissions } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary } from "@/lib/reviewmoa/types";
import { pathForMission } from "@/utils";
import { Crumb, MissionStat, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions().then(setMissions).catch((err: Error) => setError(err.message));
  }, []);

  const grouped = useMemo(
    () =>
      missions.reduce<Record<number, MissionSummary[]>>((acc, mission) => {
        const level = mission.level ?? 0;
        acc[level] = [...(acc[level] ?? []), mission];
        return acc;
      }, {}),
    [missions]
  );

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["미션"]]} />
        <PageTitle title="미션" sub="미션을 선택하면 PR 요청자 목록을 볼 수 있어요." />
        {error ? <div className="empty">미션을 불러오지 못했어요. {error}</div> : null}
        <div className="missions-list">
          {Object.entries(grouped).map(([level, items]) => (
            <section key={level} className="level-block">
              <div className="level-tag">{level === "0" ? "미분류" : `레벨 ${level}`}</div>
              <div className="mission-grid">
                {items.map((mission) => (
                  <button
                    key={mission.slug}
                    className="mission-card"
                    type="button"
                    onClick={() => router.push(pathForMission(mission.slug))}
                  >
                    <span className="mission-card-head">
                      <span>
                        <span className="mission-repo">{mission.githubRepo}</span>
                        <span className="mission-title">{mission.name}</span>
                      </span>
                    </span>
                    <span className="mission-tags">
                      <span className="tag-mini">{mission.githubOwner}</span>
                      <span className="tag-mini">{mission.githubRepo}</span>
                    </span>
                    <span className="mission-card-stats">
                      <MissionStat value={mission.cardCount.toLocaleString()} label="규칙카드" />
                      <MissionStat value={String(mission.requesterCount)} label="요청자" />
                      <MissionStat value={`#${mission.prFrom ?? "?"}-${mission.prTo ?? "?"}`} label="PR 범위" mono />
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
