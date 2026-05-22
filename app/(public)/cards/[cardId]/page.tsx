"use client";

import { useParams, useRouter } from "next/navigation";
import { CARDS, MISSIONS } from "@/components/data";
import { categoryStyle, pathForCard, pathForMission } from "@/utils";
import { GithubIcon, ShareIcon } from "@/public/icons";
import { CardSection, CodeBlock, Crumb, RailRow } from "@/components/common";

export default function Page() {
  const { cardId } = useParams<{ cardId: string }>();
  const router = useRouter();
  const card = CARDS.find((item) => item.id === cardId) ?? CARDS[0];
  const mission = MISSIONS.find((item) => item.id === card.mission) ?? MISSIONS[0];
  const related = CARDS.filter((item) => item.id !== card.id && item.cat === card.cat).slice(0, 3);

  return (
    <div className="view active">
      <div className="page page-narrow">
        <Crumb
          items={[
            ["홈", () => router.push("/")],
            ["미션", () => router.push("/missions")],
            [mission.name, () => router.push(pathForMission(mission.id))],
            [card.title]
          ]}
        />
        <div className="detail-layout">
          <main className="detail-main">
            <div className="detail-hero">
              <div className="detail-cat" style={categoryStyle(card.cat)}>
                {card.cat}
              </div>
              <div className="detail-title">{card.title}</div>
            </div>
            <CardSection icon="💥" label="어떤 문제가 있었나?" body={card.problem}>
              {card.badCode ? <CodeBlock label="❌ 문제 코드" code={card.badCode} tone="bad" /> : null}
            </CardSection>
            <CardSection icon="🔥" label="왜 문제인가?" body={card.reason} />
            <CardSection icon="✅" label="어떻게 해야 하나?" body={card.solution}>
              {card.goodCode ? <CodeBlock label="✅ 올바른 코드" code={card.goodCode} tone="good" /> : null}
            </CardSection>
            <section className="card-section">
              <div className="cs-label">
                <span className="cs-emoji">📌</span> 규칙
              </div>
              <div className="rule-box">
                {card.rules.map(([condition, action]) => (
                  <div key={condition} className="rule-box-line">
                    <span className="cond">{condition}</span> 이면 → {action}
                  </div>
                ))}
              </div>
            </section>
            <section className="card-section">
              <div className="cs-label">
                <span className="cs-emoji">🧠</span> 한 줄 요약
              </div>
              <div className="summary-box">
                <p>{card.summary}</p>
              </div>
            </section>
          </main>
          <aside className="detail-rail">
            <div className="rail-card">
              <div className="rail-title">카드 정보</div>
              <RailRow label="미션" value={mission.name} />
              <RailRow label="PR 요청자" value={`@${card.requester}`} mono />
              <RailRow
                label="리뷰어"
                value={card.reviewers.map((reviewer) => `@${reviewer}`).join(", ")}
                mono
              />
              <RailRow label="대화 수" value={String(card.conv)} mono />
              <RailRow label="PR 번호" value={`#${card.pr}`} mono />
              <div className="rail-actions">
                <button className="pr-link-btn" type="button">
                  <GithubIcon />
                  GitHub PR 보기
                </button>
                <button className="share-btn" type="button">
                  <ShareIcon />
                  공유 링크 복사
                </button>
              </div>
            </div>
            <div className="rail-card">
              <div className="rail-title">태그</div>
              <div className="rc-tags">
                {card.tags.map((tag) => (
                  <span key={tag} className="tag-mini">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rail-card">
              <div className="rail-title">관련 카드</div>
              {related.map((item) => (
                <button
                  key={item.id}
                  className="related-item"
                  type="button"
                  onClick={() => router.push(pathForCard(item.id))}
                >
                  <span className="related-title">{item.title}</span>
                  <span className="related-meta">
                    {item.cat} · @{item.requester}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
