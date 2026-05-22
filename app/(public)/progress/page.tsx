"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMissions, fetchProgressRankings } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary, ProgressRankItem } from "@/lib/reviewmoa/types";
import { cx } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [scope, setScope] = useState("all");
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [data, setData] = useState<ProgressRankItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const maxTag = Math.max(1, ...data.map((item) => item.distinctTagCount));
  const colors = ["#c2410c", "#0f766e", "#1d4ed8", "#6d28d9", "#b45309", "#15803d", "#be185d", "#0e7490"];

  useEffect(() => {
    fetchMissions().then(setMissions).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchProgressRankings({
      mission: scope === "all" ? undefined : scope,
      limit: 50
    })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [scope]);

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["발전률 랭킹"]]} />
        <PageTitle
          title="발전률 랭킹"
          sub="받은 피드백의 다양성을 기준으로 한 랭킹이에요. distinct 태그 수 → 다양성 비율 → 총 카드 수 순."
        />
        {error ? <div className="empty">발전률 랭킹을 불러오지 못했어요. {error}</div> : null}
        <div className="rank-toggle">
          {[{ slug: "all", name: "전체" }, ...missions.map((mission) => ({ slug: mission.slug, name: mission.name }))].map((mission) => (
            <button
              key={mission.slug}
              className={cx("rank-toggle-btn", scope === mission.slug && "on")}
              type="button"
              onClick={() => setScope(mission.slug)}
            >
              {mission.name}
            </button>
          ))}
        </div>
        <div className="lb-table">
          <div className="lb-row lb-head">
            <div>순위</div>
            <div>PR 요청자</div>
            <div>distinct 태그</div>
            <div>다양성 비율</div>
            <div>총 카드</div>
          </div>
          {data.map((item, index) => (
            <button
              key={item.requester}
              className="lb-row"
              type="button"
              onClick={() => undefined}
            >
              <span className={cx("lb-rank", index < 3 && "medal")}>{["🥇", "🥈", "🥉"][index] ?? index + 1}</span>
              <span className="lb-user">
                <span className="prog-avatar" style={{ background: colors[index % colors.length] }}>
                  {item.requester.slice(0, 2)}
                </span>
                <span className="prog-id">{item.requester}</span>
              </span>
              <span>
                <span className="lb-num">
                  {item.distinctTagCount}
                  <span className="lb-num-label"> 개</span>
                </span>
                <span className="lb-bar-mini">
                  <span
                    className="lb-bar-mini-fill"
                    style={{ width: `${(item.distinctTagCount / maxTag) * 100}%` }}
                  />
                </span>
              </span>
              <span className="lb-num">
                {(item.tagDiversityRatio * 100).toFixed(0)}
                <span className="lb-num-label">%</span>
              </span>
              <span className="lb-num">{item.totalCardCount}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
