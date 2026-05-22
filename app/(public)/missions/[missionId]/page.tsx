"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { missions, requesters } from "@/components/data";
import { pathForRequester } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = use(params);
  const router = useRouter();
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];
  const missionRequesters = requesters[mission.id] ?? [];

  return (
    <div className="view active">
      <div className="page">
        <Crumb
          items={[["홈", () => router.push("/")], ["미션", () => router.push("/missions")], [mission.name]]}
        />
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
            <button
              key={id}
              className="requester-card"
              type="button"
              onClick={() => router.push(pathForRequester(mission.id, id))}
            >
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
