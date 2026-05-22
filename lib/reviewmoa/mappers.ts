import type { CardTag, ReviewCardDetail, ReviewCardListItem } from "./types";

type RawTag = {
  slug?: string;
  name?: string;
  sort_order?: number;
};

export type RawReviewCardDetail = {
  id: string;
  title: string;
  summary: string;
  problem?: string | null;
  reason?: string | null;
  solution?: string | null;
  rule?: string | null;
  markdown?: string | null;
  bad_code?: string | null;
  good_code?: string | null;
  code_language?: string | null;
  requester: string;
  reviewer_ids?: string[] | null;
  conversation_count?: number | null;
  pr_number: number;
  source_pr_url?: string | null;
  status?: string;
  created_at?: string | null;
  mission_slug: string;
  mission_name: string;
  category_slug: string;
  category_name: string;
  tags?: RawTag[] | null;
};

function mapTags(tags: RawTag[] | null | undefined): CardTag[] {
  return (tags ?? [])
    .filter((tag): tag is Required<RawTag> => Boolean(tag.slug && tag.name && tag.sort_order))
    .map((tag) => ({
      slug: tag.slug,
      name: tag.name,
      sortOrder: tag.sort_order
    }));
}

export function mapReviewCardListItem(row: RawReviewCardDetail): ReviewCardListItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    requester: row.requester,
    prNumber: row.pr_number,
    sourcePrUrl: row.source_pr_url ?? null,
    mission: {
      slug: row.mission_slug,
      name: row.mission_name
    },
    category: {
      slug: row.category_slug,
      name: row.category_name
    },
    tags: mapTags(row.tags),
    createdAt: row.created_at ?? ""
  };
}

export function mapReviewCardDetail(row: RawReviewCardDetail): ReviewCardDetail {
  return {
    ...mapReviewCardListItem(row),
    problem: row.problem ?? "",
    reason: row.reason ?? "",
    solution: row.solution ?? "",
    rule: row.rule ?? null,
    markdown: row.markdown ?? null,
    badCode: row.bad_code ?? null,
    goodCode: row.good_code ?? null,
    codeLanguage: row.code_language ?? "text",
    reviewerIds: row.reviewer_ids ?? [],
    conversationCount: row.conversation_count ?? 0
  };
}
