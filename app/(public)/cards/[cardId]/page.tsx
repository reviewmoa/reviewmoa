"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchCard, fetchCards } from "@/lib/reviewmoa/clientApi";
import type { ReviewCardDetail, ReviewCardListItem } from "@/lib/reviewmoa/types";
import { categoryStyle, pathForCard, pathForMission } from "@/utils";
import { GithubIcon, ShareIcon } from "@/public/icons";
import { CardSection, CodeBlock, Crumb, RailRow } from "@/components/common";

export default function Page() {
  const { cardId } = useParams<{ cardId: string }>();
  const router = useRouter();
  const [card, setCard] = useState<ReviewCardDetail | null>(null);
  const [related, setRelated] = useState<ReviewCardListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCard(cardId)
      .then((nextCard) => {
        setCard(nextCard);
        return fetchCards({
          category: nextCard.category.slug,
          limit: 4
        });
      })
      .then((result) => setRelated(result.items.filter((item) => item.id !== cardId).slice(0, 3)))
      .catch((err: Error) => setError(err.message));
  }, [cardId]);

  if (!card) {
    return (
      <div className="view active">
        <div className="page page-narrow">
          <Crumb items={[["홈", () => router.push("/")], ["카드"]]} />
          <div className="empty">{error ? `카드를 불러오지 못했어요. ${error}` : "카드를 불러오고 있어요."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="view active">
      <div className="page page-narrow">
        <Crumb
          items={[
            ["홈", () => router.push("/")],
            ["미션", () => router.push("/missions")],
            [card.mission.name, () => router.push(pathForMission(card.mission.slug))],
            [card.title]
          ]}
        />
        <div className="detail-layout">
          <main className="detail-main">
            <div className="detail-hero">
              <div className="detail-cat" style={categoryStyle(card.category.name)}>
                {card.category.name}
              </div>
              <div className="detail-title">{card.title}</div>
            </div>
            <CardSection icon="💥" label="어떤 문제가 있었나?" body={card.problem}>
              {card.badCode ? <CodeBlock label="문제 코드" code={card.badCode} tone="bad" /> : null}
            </CardSection>
            <CardSection icon="🔥" label="왜 문제인가?" body={card.reason} />
            <CardSection icon="✅" label="어떻게 해야 하나?" body={card.solution}>
              {card.goodCode ? <CodeBlock label="올바른 코드" code={card.goodCode} tone="good" /> : null}
            </CardSection>
            {card.rule ? (
              <section className="card-section">
                <div className="cs-label">
                  <span className="cs-emoji">📌</span> 규칙
                </div>
                <div className="rule-box">
                  <div className="rule-box-line">{card.rule}</div>
                </div>
              </section>
            ) : null}
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
              <RailRow label="미션" value={card.mission.name} />
              <RailRow label="PR 요청자" value={`@${card.requester}`} mono />
              <RailRow
                label="리뷰어"
                value={card.reviewerIds.map((reviewer) => `@${reviewer}`).join(", ") || "-"}
                mono
              />
              <RailRow label="대화 수" value={String(card.conversationCount)} mono />
              <RailRow label="PR 번호" value={`#${card.prNumber}`} mono />
              <div className="rail-actions">
                <button
                  className="pr-link-btn"
                  type="button"
                  onClick={() => card.sourcePrUrl && window.open(card.sourcePrUrl, "_blank", "noopener,noreferrer")}
                >
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
                  <span key={tag.slug} className="tag-mini">
                    {tag.name}
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
                    {item.category.name} · @{item.requester}
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
