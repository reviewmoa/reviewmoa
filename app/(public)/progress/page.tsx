"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { progress } from "@/components/data";
import { cx } from "@/utils";
import { Crumb, PageTitle } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [scope, setScope] = useState("all");
  const data = progress[scope] ?? progress.all;
  const maxTag = Math.max(...data.map((item) => item[1]));
  const colors = ["#c2410c", "#0f766e", "#1d4ed8", "#6d28d9", "#b45309", "#15803d", "#be185d", "#0e7490"];

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["발전률 랭킹"]]} />
        <PageTitle
          title="발전률 랭킹"
          sub="받은 피드백의 다양성을 기준으로 한 랭킹이에요. distinct 태그 수 → 다양성 비율 → 총 카드 수 순."
        />
        <div className="rank-toggle">
          {[
            ["all", "전체"],
            ["m1", "roomescape-member"],
            ["m2", "shopping-order"]
          ].map(([value, label]) => (
            <button
              key={value}
              className={cx("rank-toggle-btn", scope === value && "on")}
              type="button"
              onClick={() => setScope(value)}
            >
              {label}
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
          {data.map(([id, tagCount, ratio, total], index) => (
            <button
              key={id}
              className="lb-row"
              type="button"
              onClick={() => window.alert(`@${id} 카드 보기는 데모에서 생략`)}
            >
              <span className={cx("lb-rank", index < 3 && "medal")}>{["🥇", "🥈", "🥉"][index] ?? index + 1}</span>
              <span className="lb-user">
                <span className="prog-avatar" style={{ background: colors[index % colors.length] }}>
                  {id.slice(0, 2)}
                </span>
                <span className="prog-id">{id}</span>
              </span>
              <span>
                <span className="lb-num">
                  {tagCount}
                  <span className="lb-num-label"> 개</span>
                </span>
                <span className="lb-bar-mini">
                  <span className="lb-bar-mini-fill" style={{ width: `${(tagCount / maxTag) * 100}%` }} />
                </span>
              </span>
              <span className="lb-num">
                {(ratio * 100).toFixed(0)}
                <span className="lb-num-label">%</span>
              </span>
              <span className="lb-num">{total}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
