"use client";

import { useRouter } from "next/navigation";
import type { CategoryName } from "@/types";
import { missions, progress, tagRank } from "@/components/data";
import { accentOf, cx, pathForCategory, pathForMission } from "@/utils";
import { HeroStat, Panel } from "@/components/common";

export default function Page() {
  const router = useRouter();
  const catCounts: Array<[CategoryName, number]> = [
    ["레이어 분리", 680],
    ["객체지향", 542],
    ["아키텍처", 431],
    ["예외처리", 388],
    ["네이밍", 312],
    ["테스트", 294]
  ];
  const maxTag = Math.max(...tagRank.m1.map((tag) => tag[1]));
  const maxCat = Math.max(...catCounts.map((cat) => cat[1]));
  const maxMission = Math.max(...missions.map((mission) => mission.cards));

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
            <HeroStat value="2,847" label="규칙카드" />
            <HeroStat value="3" label="미션" />
            <HeroStat value="98" label="PR 요청자" />
            <HeroStat value="24" label="카테고리" />
          </div>
        </section>

        <button className="random-teaser home-random" type="button" onClick={() => router.push("/random")}>
          <div className="random-teaser-label">🎲 오늘의 랜덤 규칙카드</div>
          <div className="random-teaser-title">도메인은 인프라 기술을 몰라야 해요</div>
          <div className="random-teaser-sum">
            도메인이 ResultSet 같은 기술 타입을 알게 되면, 나중에 JDBC를 걷어낼 때 도메인까지 같이 고쳐야 하거든요.
          </div>
          <div className="random-teaser-cta">다른 카드 뽑아보기 →</div>
        </button>

        <div className="home-grid">
          <Panel title="태그 랭킹" more="전체 보기 →" onMore={() => router.push("/tagrank")}>
            <div className="rank-list">
              {tagRank.m1.map(([name, value], index) => (
                <button
                  key={name}
                  className={cx("rank-row", index < 3 && "top")}
                  type="button"
                  onClick={() => router.push("/tagrank")}
                >
                  <span className="rank-num">{index + 1}</span>
                  <span className="rank-name">{name}</span>
                  <span className="rank-bar-wrap">
                    <span className="rank-bar" style={{ width: `${(value / maxTag) * 100}%` }} />
                  </span>
                  <span className="rank-val">{value}</span>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="카테고리 분포" more="전체 보기 →" onMore={() => router.push("/categories")}>
            <div className="cat-dist">
              {catCounts.map(([cat, count]) => (
                <button
                  key={cat}
                  className="cat-dist-row"
                  type="button"
                  onClick={() => router.push(pathForCategory(cat))}
                >
                  <span className="cat-dist-top">
                    <span className="cat-dist-name">
                      <span className="cat-dot" style={{ background: accentOf(cat) }} />
                      {cat}
                    </span>
                    <span className="cat-dist-val">{count}</span>
                  </span>
                  <span className="cat-dist-bar-wrap">
                    <span
                      className="cat-dist-bar"
                      style={{ width: `${(count / maxCat) * 100}%`, background: accentOf(cat) }}
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
              {progress.all.slice(0, 5).map(([id, tags, , total], index) => (
                <button key={id} className="prog-row" type="button" onClick={() => router.push("/progress")}>
                  <span className="prog-medal">{["🥇", "🥈", "🥉"][index] ?? index + 1}</span>
                  <span className="prog-avatar">{id.slice(0, 2)}</span>
                  <span className="prog-info">
                    <span className="prog-id">{id}</span>
                    <span className="prog-meta">
                      distinct 태그 {tags} · 카드 {total}
                    </span>
                  </span>
                  <span className="prog-score">{tags}</span>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="미션별 카드 수" more="전체 보기 →" onMore={() => router.push("/missions")}>
            <div className="cat-dist">
              {missions.map((mission) => (
                <button
                  key={mission.id}
                  className="cat-dist-row"
                  type="button"
                  onClick={() => router.push(pathForMission(mission.id))}
                >
                  <span className="cat-dist-top">
                    <span className="cat-dist-name">{mission.name}</span>
                    <span className="cat-dist-val">{mission.cards.toLocaleString()}</span>
                  </span>
                  <span className="cat-dist-bar-wrap">
                    <span
                      className="cat-dist-bar mission-bar"
                      style={{ width: `${(mission.cards / maxMission) * 100}%` }}
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
