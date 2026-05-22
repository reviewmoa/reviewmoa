export type CardTag = {
  slug: string;
  name: string;
  sortOrder: number;
};

export type MissionSummary = {
  id: string;
  slug: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  prBaseUrl: string;
  cardCount: number;
};

export type CategorySummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cardCount: number;
};

export type ReviewCardListItem = {
  id: string;
  title: string;
  summary: string;
  requester: string;
  prNumber: number;
  sourcePrUrl: string | null;
  mission: {
    slug: string;
    name: string;
  };
  category: {
    slug: string;
    name: string;
  };
  tags: CardTag[];
  createdAt: string;
};

export type ReviewCardDetail = ReviewCardListItem & {
  problem: string;
  reason: string;
  solution: string;
  rule: string | null;
  markdown: string | null;
  badCode: string | null;
  goodCode: string | null;
  codeLanguage: string;
  reviewerIds: string[];
  conversationCount: number;
};

export type TagRankItem = {
  tagSlug: string;
  tagName: string;
  cardCount: number;
};

export type ProgressRankItem = {
  requester: string;
  totalCardCount: number;
  distinctTagCount: number;
  tagDiversityRatio: number;
  topTags: Array<{
    slug: string;
    name: string;
  }>;
};

export type HomeSummary = {
  totalCardCount: number;
  missionCardCounts: Array<{
    missionSlug: string;
    missionName: string;
    cardCount: number;
  }>;
  categoryCounts: Array<{
    categorySlug: string;
    categoryName: string;
    cardCount: number;
  }>;
  topTags: TagRankItem[];
  topRequesters: ProgressRankItem[];
  randomCards: ReviewCardListItem[];
};

export type CardsQuery = {
  mission?: string;
  requester?: string;
  category?: string;
  tags?: string[];
  q?: string;
  page?: number;
  limit?: number;
  sort?: "latest" | "pr_number" | "tag_count";
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
