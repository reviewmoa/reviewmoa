"use client";

import { useRouter } from "next/navigation";
import { missions, tagRank } from "@/components/data";
import { cx } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["태그 랭킹"]]} />
        <PageTitle title="태그 랭킹" sub="미션별로 가장 많이 나온 피드백 태그예요." />
        <div className="tag-rank-grid tagrank-grid">
          {missions.map((mission) => {
            const data = tagRank[mission.id];
            const max = Math.max(...data.map((item) => item[1]));
            return (
              <section key={mission.id} className="tag-rank-panel">
                <div className="tag-rank-mission">{mission.name}</div>
                <div className="tag-rank-sub">
                  PR #{mission.prRange} · 카드 {mission.cards.toLocaleString()}개
                </div>
                <div className="rank-list">
                  {data.map(([name, value], index) => (
                    <div key={name} className={cx("rank-row", index < 3 && "top")}>
                      <div className="rank-num">{index + 1}</div>
                      <div className="rank-name">{name}</div>
                      <div className="rank-bar-wrap">
                        <div className="rank-bar" style={{ width: `${(value / max) * 100}%` }} />
                      </div>
                      <div className="rank-val">{value}</div>
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
