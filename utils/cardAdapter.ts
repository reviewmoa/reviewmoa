import type { ReviewCardDetail, ReviewCardListItem } from "@/lib/reviewmoa/types";
import type { RuleCard } from "@/types";

export function toRuleCard(card: ReviewCardListItem | ReviewCardDetail): RuleCard {
  return {
    id: card.id,
    mission: card.mission.slug,
    cat: card.category.name,
    tags: card.tags.map((tag) => tag.name),
    requester: card.requester,
    reviewers: "reviewerIds" in card ? card.reviewerIds : [],
    conv: "conversationCount" in card ? card.conversationCount : 0,
    title: card.title,
    summary: card.summary,
    problem: "problem" in card ? card.problem : card.summary,
    reason: "reason" in card ? card.reason : "",
    solution: "solution" in card ? card.solution : "",
    badCode: "badCode" in card ? (card.badCode ?? undefined) : undefined,
    goodCode: "goodCode" in card ? (card.goodCode ?? undefined) : undefined,
    rules: "rule" in card && card.rule ? [["리뷰에서 같은 문제가 반복될 때", card.rule]] : [],
    pr: card.prNumber
  };
}
