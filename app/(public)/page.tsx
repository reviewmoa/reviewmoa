"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchHomeSummary } from "@/lib/reviewmoa/clientApi";
import type { HomeSummary } from "@/lib/reviewmoa/types";
import { accentOf, cx, pathForCategory, pathForMission } from "@/utils";
import { HeroStat, Panel } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeSummary().then(setSummary).catch((err: Error) => setError(err.message));
  }, []);

  const topTags = summary?.topTags.slice(0, 6) ?? [];
  const categoryCounts = summary?.categoryCounts.slice(0, 6) ?? [];
  const missionCounts = summary?.missionCardCounts ?? [];
  const randomCard = summary?.randomCards[0];
  const maxTag = Math.max(1, ...topTags.map((tag) => tag.cardCount));
  const maxCat = Math.max(1, ...categoryCounts.map((cat) => cat.cardCount));
  const maxMission = Math.max(1, ...missionCounts.map((mission) => mission.cardCount));
  const totalRequesters = summary?.topRequesters.length ?? 0;

  return (
    <div className="view active">
      <div className="page">
        <section className="hero">
          <div className="hero-eyebrow">Woowacourse · Code Review Archive</div>
          <h1>
            흩어진 PR 리뷰를,
            <br />
            <em>다시 꺼내 보는 규칙카드</em>로.
          </h1>
          <p>
            우아한테크코스 미션 PR 리뷰를 재사용 가능한 학습 규칙카드로 정리했어요. 미션별·요청자별·카테고리별로
            탐색해보세요.
          </p>
          <div className="hero-stats">
            <HeroStat value={(summary?.totalCardCount ?? 0).toLocaleString()} label="규칙카드" />
            <HeroStat value={String(missionCounts.length)} label="미션" />
            <HeroStat value={String(totalRequesters)} label="PR 요청자" />
            <HeroStat value={String(categoryCounts.length)} label="카테고리" />
          </div>
        </section>

        {error ? <div className="empty">데이터를 불러오지 못했어요. {error}</div> : null}

        <button className="random-teaser home-random" type="button" onClick={() => router.push("/random")}>
          <div className="random-teaser-label">🎲 오늘의 랜덤 규칙카드</div>
          <div className="random-teaser-title">{randomCard?.title ?? "카드를 불러오는 중이에요"}</div>
          <div className="random-teaser-sum">
            {randomCard?.summary ?? "DB에 저장된 리뷰카드를 가져오고 있어요."}
          </div>
          <div className="random-teaser-cta">다른 카드 뽑아보기 →</div>
        </button>

        <div className="home-grid">
          <Panel title="태그 랭킹" more="전체 보기 →" onMore={() => router.push("/tagrank")}>
            <div className="rank-list">
              {topTags.map((tag, index) => (
                <button
                  key={tag.tagSlug}
                  className={cx("rank-row", index < 3 && "top")}
                  type="button"
                  onClick={() => router.push("/tagrank")}
                >
                  <span className="rank-num">{index + 1}</span>
                  <span className="rank-name">{tag.tagName}</span>
                  <span className="rank-bar-wrap">
                    <span className="rank-bar" style={{ width: `${(tag.cardCount / maxTag) * 100}%` }} />
                  </span>
                  <span className="rank-val">{tag.cardCount}</span>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="카테고리 분포" more="전체 보기 →" onMore={() => router.push("/categories")}>
            <div className="cat-dist">
              {categoryCounts.map((category) => (
                <button
                  key={category.categorySlug}
                  className="cat-dist-row"
                  type="button"
                  onClick={() => router.push(pathForCategory(category.categorySlug))}
                >
                  <span className="cat-dist-top">
                    <span className="cat-dist-name">
                      <span className="cat-dot" style={{ background: accentOf(category.categoryName) }} />
                      {category.categoryName}
                    </span>
                    <span className="cat-dist-val">{category.cardCount}</span>
                  </span>
                  <span className="cat-dist-bar-wrap">
                    <span
                      className="cat-dist-bar"
                      style={{
                        width: `${(category.cardCount / maxCat) * 100}%`,
                        background: accentOf(category.categoryName)
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="home-grid home-grid-even">
          <Panel title="발전률 랭킹 미리보기" more="전체 보기 →" onMore={() => router.push("/progress")}>
            <div className="prog-list">
              {(summary?.topRequesters.slice(0, 5) ?? []).map((requester, index) => (
                <button key={requester.requester} className="prog-row" type="button" onClick={() => router.push("/progress")}>
                  <span className="prog-medal">{["🥇", "🥈", "🥉"][index] ?? index + 1}</span>
                  <span className="prog-avatar">{requester.requester.slice(0, 2)}</span>
                  <span className="prog-info">
                    <span className="prog-id">{requester.requester}</span>
                    <span className="prog-meta">
                      distinct 태그 {requester.distinctTagCount} · 카드 {requester.totalCardCount}
                    </span>
                  </span>
                  <span className="prog-score">{requester.distinctTagCount}</span>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="미션별 카드 수" more="전체 보기 →" onMore={() => router.push("/missions")}>
            <div className="cat-dist">
              {missionCounts.map((mission) => (
                <button
                  key={mission.missionSlug}
                  className="cat-dist-row"
                  type="button"
                  onClick={() => router.push(pathForMission(mission.missionSlug))}
                >
                  <span className="cat-dist-top">
                    <span className="cat-dist-name">{mission.missionName}</span>
                    <span className="cat-dist-val">{mission.cardCount.toLocaleString()}</span>
                  </span>
                  <span className="cat-dist-bar-wrap">
                    <span
                      className="cat-dist-bar mission-bar"
                      style={{ width: `${(mission.cardCount / maxMission) * 100}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
