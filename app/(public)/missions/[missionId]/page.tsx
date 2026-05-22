"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchMissionRequesters, fetchMissions, type MissionRequesterSummary } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary } from "@/lib/reviewmoa/types";
import { pathForRequester } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const { missionId } = useParams<{ missionId: string }>();
  const router = useRouter();
  const [mission, setMission] = useState<MissionSummary | null>(null);
  const [missionRequesters, setMissionRequesters] = useState<MissionRequesterSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMissions(), fetchMissionRequesters(missionId)])
      .then(([missions, requesters]) => {
        setMission(missions.find((item) => item.slug === missionId) ?? null);
        setMissionRequesters(requesters);
      })
      .catch((err: Error) => setError(err.message));
  }, [missionId]);

  const title = mission?.name ?? missionId;

  return (
    <div className="view active">
      <div className="page">
        <Crumb
          items={[["홈", () => router.push("/")], ["미션", () => router.push("/missions")], [title]]}
        />
        <PageTitle
          title={title}
          sub={`${mission?.githubRepo ?? ""} · 규칙카드 ${(mission?.cardCount ?? 0).toLocaleString()}개 · PR #${mission?.prFrom ?? "?"}-${mission?.prTo ?? "?"}`}
        />
        {error ? <div className="empty">요청자 목록을 불러오지 못했어요. {error}</div> : null}
        <div className="sec-head requesters-sec">
          <div className="sec-title">
            PR 요청자 <span className="muted-normal">{missionRequesters.length}명</span>
          </div>
        </div>
        <div className="requester-grid">
          {missionRequesters.map((requester) => (
            <button
              key={requester.requester}
              className="requester-card"
              type="button"
              onClick={() => router.push(pathForRequester(missionId, requester.requester))}
            >
              <span className="req-avatar">
                {requester.requester.slice(0, 2)}
              </span>
              <span className="req-info">
                <span className="req-id">{requester.requester}</span>
                <span className="req-count">규칙카드 {requester.cardCount}개</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
