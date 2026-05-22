"use client";

import { useEffect, useState } from "react";
import { fetchAdminMissions, fetchMissions, type AdminMission } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary } from "@/lib/reviewmoa/types";
import { MissionRow } from "./missionRow";

export function MissionTable() {
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [publicMissions, setPublicMissions] = useState<MissionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminMissions(), fetchMissions()])
      .then(([adminMissions, nextPublicMissions]) => {
        setMissions(adminMissions);
        setPublicMissions(nextPublicMissions);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const cardCountBySlug = new Map(publicMissions.map((mission) => [mission.slug, mission.cardCount]));

  return (
    <div className="job-table">
      <div className="job-row job-head">
        <div>미션명</div>
        <div>owner</div>
        <div>repo</div>
        <div>카드</div>
        <div>상태</div>
      </div>
      {error ? <div className="empty">미션을 불러오지 못했어요. {error}</div> : null}
      {missions.map((mission) => (
        <MissionRow
          key={mission.id}
          name={mission.name}
          owner={mission.githubOwner}
          repo={mission.githubRepo}
          count={(cardCountBySlug.get(mission.slug) ?? 0).toLocaleString()}
          isActive={mission.isActive}
        />
      ))}
    </div>
  );
}
