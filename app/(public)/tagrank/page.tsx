"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMissions, fetchTagRankings } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary, TagRankItem } from "@/lib/reviewmoa/types";
import { cx } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [rankings, setRankings] = useState<Record<string, TagRankItem[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions()
      .then(async (nextMissions) => {
        setMissions(nextMissions);
        const entries = await Promise.all(
          nextMissions.map(async (mission) => [
            mission.slug,
            await fetchTagRankings({
              mission: mission.slug,
              limit: 10
            })
          ] as const)
        );
        setRankings(Object.fromEntries(entries));
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["태그 랭킹"]]} />
        <PageTitle title="태그 랭킹" sub="미션별로 가장 많이 나온 피드백 태그예요." />
        {error ? <div className="empty">태그 랭킹을 불러오지 못했어요. {error}</div> : null}
        <div className="tag-rank-grid tagrank-grid">
          {missions.map((mission) => {
            const data = rankings[mission.slug] ?? [];
            const max = Math.max(1, ...data.map((item) => item.cardCount));
            return (
              <section key={mission.slug} className="tag-rank-panel">
                <div className="tag-rank-mission">{mission.name}</div>
                <div className="tag-rank-sub">
                  PR #{mission.prFrom ?? "?"}-{mission.prTo ?? "?"} · 카드 {mission.cardCount.toLocaleString()}개
                </div>
                <div className="rank-list">
                  {data.map((tag, index) => (
                    <div key={tag.tagSlug} className={cx("rank-row", index < 3 && "top")}>
                      <div className="rank-num">{index + 1}</div>
                      <div className="rank-name">{tag.tagName}</div>
                      <div className="rank-bar-wrap">
                        <div className="rank-bar" style={{ width: `${(tag.cardCount / max) * 100}%` }} />
                      </div>
                      <div className="rank-val">{tag.cardCount}</div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
