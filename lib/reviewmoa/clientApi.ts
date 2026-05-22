import type {
  CategorySummary,
  HomeSummary,
  MissionSummary,
  PaginatedResult,
  ProgressRankItem,
  ReviewCardDetail,
  ReviewCardListItem,
  TagRankItem
} from "./types";

type ApiSuccess<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type MissionRequesterSummary = {
  requester: string;
  prCount: number;
  cardCount: number;
  distinctTagCount: number;
};

export type AdminMission = {
  id: string;
  slug: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  prBaseUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GenerationJobListItem = {
  id: string;
  mission: {
    id: string;
    slug: string;
    name: string;
  };
  requestedBy: string | null;
  prStart: number;
  prEnd: number;
  excludedPrNumbers: number[];
  status: "pending" | "running" | "completed" | "failed" | "partial_failed";
  totalPrCount: number;
  successPrCount: number;
  failedPrCount: number;
  resultCardCount: number;
  errorSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    credentials: "same-origin"
  });
  const payload = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error.message : "API request failed");
  }

  return payload;
}

function buildQuery(params: Record<string, string | number | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(","));
      }
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export async function fetchHomeSummary() {
  return (await request<HomeSummary>("/api/home/summary")).data;
}

export async function fetchMissions() {
  return (await request<MissionSummary[]>("/api/missions")).data;
}

export async function fetchMissionRequesters(missionSlug: string) {
  return (await request<MissionRequesterSummary[]>(`/api/missions/${missionSlug}/requesters`)).data;
}

export async function fetchCategories() {
  return (await request<CategorySummary[]>("/api/categories")).data;
}

export async function fetchCards(params: {
  mission?: string;
  requester?: string;
  category?: string;
  tags?: string[];
  q?: string;
  page?: number;
  limit?: number;
  sort?: "latest" | "pr_number" | "tag_count";
} = {}): Promise<PaginatedResult<ReviewCardListItem>> {
  const payload = await request<ReviewCardListItem[]>(`/api/cards${buildQuery(params)}`);

  return {
    items: payload.data,
    page: payload.meta?.page ?? params.page ?? 1,
    limit: payload.meta?.limit ?? params.limit ?? 20,
    total: payload.meta?.total ?? payload.data.length
  };
}

export async function fetchCard(cardId: string) {
  return (await request<ReviewCardDetail>(`/api/cards/${cardId}`)).data;
}

export async function fetchRandomCard(params: { mission?: string; category?: string } = {}) {
  return (await request<ReviewCardListItem>(`/api/random-card${buildQuery(params)}`)).data;
}

export async function fetchTagRankings(params: { mission?: string; limit?: number } = {}) {
  return (await request<TagRankItem[]>(`/api/rankings/tags${buildQuery(params)}`)).data;
}

export async function fetchProgressRankings(params: { mission?: string; limit?: number } = {}) {
  return (await request<ProgressRankItem[]>(`/api/rankings/progress${buildQuery(params)}`)).data;
}

export async function fetchAdminMissions() {
  return (await request<AdminMission[]>("/api/admin/missions")).data;
}

export async function createAdminMission(input: {
  slug: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  prBaseUrl: string;
  isActive?: boolean;
}) {
  return (
    await request<AdminMission>("/api/admin/missions", {
      method: "POST",
      body: JSON.stringify(input)
    })
  ).data;
}

export async function fetchGenerationJobs() {
  const payload = await request<GenerationJobListItem[]>("/api/admin/generation-jobs?limit=50");

  return payload.data;
}

export async function createGenerationJob(input: {
  missionId: string;
  prStart: number;
  prEnd: number;
  excludedPrNumbers?: number[];
}) {
  return (
    await request<GenerationJobListItem>("/api/admin/generation-jobs", {
      method: "POST",
      body: JSON.stringify({
        excludedPrNumbers: [],
        ...input
      })
    })
  ).data;
}

export async function retryGenerationJob(jobId: string) {
  return (
    await request<{ jobId: string; retriedPrNumbers: number[]; status: string }>(
      `/api/admin/generation-jobs/${jobId}/retry`,
      {
        method: "POST",
        body: JSON.stringify({})
      }
    )
  ).data;
}
