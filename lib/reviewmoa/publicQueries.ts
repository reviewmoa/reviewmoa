import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapReviewCardDetail, mapReviewCardListItem } from "./mappers";
import type {
  CardsQuery,
  CategorySummary,
  HomeSummary,
  MissionSummary,
  PaginatedResult,
  ProgressRankItem,
  ReviewCardDetail,
  ReviewCardListItem,
  TagRankItem
} from "./types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

type MissionRow = {
  id: string;
  slug: string;
  name: string;
  owner: string;
  repo: string;
  pr_base_url: string;
  status: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type CardIdRow = {
  review_card_id: string;
};

type RankingCardRow = {
  requester: string;
  tags: Array<{ slug?: string; name?: string } | string> | null;
};

type TagLookupRow = {
  slug: string;
  name: string;
};

function clampPage(value = 1) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function clampLimit(value = DEFAULT_LIMIT) {
  if (!Number.isFinite(value) || value < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(value), MAX_LIMIT);
}

function normalizeTags(tags: string[] | undefined) {
  return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
}

function escapeIlike(value: string) {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", " ");
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>(
    (acc, value) => ({
      ...acc,
      [value]: (acc[value] ?? 0) + 1
    }),
    {} as Record<T, number>
  );
}

export async function getMissions(active = true): Promise<MissionSummary[]> {
  const supabase = await createSupabaseServerClient();
  const missionQuery = supabase
    .from("missions")
    .select("id, slug, name, owner, repo, pr_base_url, status")
    .order("display_order", { ascending: true });

  if (active) {
    missionQuery.eq("status", "active");
  }

  const [{ data: missions, error: missionsError }, { data: cards, error: cardsError }] =
    await Promise.all([
      missionQuery.returns<MissionRow[]>(),
      supabase.from("review_card_details").select("mission_slug").eq("status", "published")
    ]);

  if (missionsError) {
    throw missionsError;
  }

  if (cardsError) {
    throw cardsError;
  }

  const cardCountByMission = countBy((cards ?? []).map((card) => card.mission_slug as string));

  return (missions ?? []).map((mission) => ({
    id: mission.id,
    slug: mission.slug,
    name: mission.name,
    githubOwner: mission.owner,
    githubRepo: mission.repo,
    prBaseUrl: mission.pr_base_url,
    cardCount: cardCountByMission[mission.slug] ?? 0
  }));
}

export async function getMissionRequesters(missionSlug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("review_card_details")
    .select("requester, pr_number, tags")
    .eq("mission_slug", missionSlug)
    .eq("status", "published");

  if (error) {
    throw error;
  }

  const requesters = new Map<
    string,
    {
      requester: string;
      prNumbers: Set<number>;
      cardCount: number;
      tagSlugs: Set<string>;
    }
  >();

  (data ?? []).forEach((card) => {
    const current =
      requesters.get(card.requester) ??
      {
        requester: card.requester,
        prNumbers: new Set<number>(),
        cardCount: 0,
        tagSlugs: new Set<string>()
      };

    current.prNumbers.add(card.pr_number);
    current.cardCount += 1;
    (card.tags as Array<{ slug?: string; name?: string } | string> | null | undefined)?.forEach((tag) => {
      const tagKey = getTagSlug(tag) ?? getTagName(tag);

      if (tagKey) {
        current.tagSlugs.add(tagKey);
      }
    });
    requesters.set(card.requester, current);
  });

  return [...requesters.values()]
    .map((requester) => ({
      requester: requester.requester,
      prCount: requester.prNumbers.size,
      cardCount: requester.cardCount,
      distinctTagCount: requester.tagSlugs.size
    }))
    .sort((a, b) => b.cardCount - a.cardCount || a.requester.localeCompare(b.requester));
}

export async function getCategories(): Promise<CategorySummary[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: categories, error: categoriesError }, { data: cards, error: cardsError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, slug, name, description")
        .order("name", { ascending: true })
        .returns<CategoryRow[]>(),
      supabase.from("review_card_details").select("category_slug").eq("status", "published")
    ]);

  if (categoriesError) {
    throw categoriesError;
  }

  if (cardsError) {
    throw cardsError;
  }

  const cardCountByCategory = countBy((cards ?? []).map((card) => card.category_slug as string));

  return (categories ?? []).map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    cardCount: cardCountByCategory[category.slug] ?? 0
  }));
}

async function getCardIdsByTagSlugs(tagSlugs: string[]) {
  const tags = normalizeTags(tagSlugs);

  if (tags.length === 0) {
    return undefined;
  }

  const supabase = await createSupabaseServerClient();
  const { data: tagsBySlug, error: slugError } = await supabase
    .from("tags")
    .select("id")
    .in("slug", tags);

  if (slugError) {
    throw slugError;
  }

  const { data: tagsByName, error: nameError } = await supabase
    .from("tags")
    .select("id")
    .in("name", tags);

  if (nameError) {
    throw nameError;
  }

  const tagIds = [
    ...new Set([
      ...(tagsBySlug ?? []).map((tag) => tag.id as string),
      ...(tagsByName ?? []).map((tag) => tag.id as string)
    ])
  ];

  if (tagIds.length === 0) {
    return [];
  }

  const { data: cardTags, error: cardTagsError } = await supabase
    .from("review_card_tags")
    .select("review_card_id")
    .in("tag_id", tagIds)
    .returns<CardIdRow[]>();

  if (cardTagsError) {
    throw cardTagsError;
  }

  return [...new Set((cardTags ?? []).map((cardTag) => cardTag.review_card_id))];
}

async function getTagSlugByName(tagNames: string[]) {
  const names = [...new Set(tagNames.filter(Boolean))];

  if (names.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .select("slug, name")
    .returns<TagLookupRow[]>();

  if (error) {
    throw error;
  }

  const wantedNames = new Set(names);

  return new Map(
    (data ?? [])
      .filter((tag) => wantedNames.has(tag.name))
      .map((tag) => [tag.name, tag.slug])
  );
}

async function hydrateCardTagSlugs<T extends ReviewCardListItem>(items: T[]) {
  const slugByName = await getTagSlugByName(
    items.flatMap((item) => item.tags.map((tag) => tag.name))
  );

  return items.map((item) => ({
    ...item,
    tags: item.tags.map((tag) => ({
      ...tag,
      slug: slugByName.get(tag.name) ?? tag.slug
    }))
  }));
}

function getTagName(tag: { slug?: string; name?: string } | string) {
  return typeof tag === "string" ? tag : tag.name;
}

function getTagSlug(tag: { slug?: string; name?: string } | string) {
  return typeof tag === "string" ? tag : tag.slug;
}

export async function getCards(query: CardsQuery = {}): Promise<PaginatedResult<ReviewCardListItem>> {
  const supabase = await createSupabaseServerClient();
  const page = clampPage(query.page);
  const limit = clampLimit(query.limit);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const tagSlugs = normalizeTags(query.tags);
  const cardIds = await getCardIdsByTagSlugs(tagSlugs);

  if (cardIds && cardIds.length === 0) {
    return { items: [], page, limit, total: 0 };
  }

  let cardQuery = supabase
    .from("review_card_details")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (query.mission) {
    cardQuery = cardQuery.eq("mission_slug", query.mission);
  }

  if (query.requester) {
    cardQuery = cardQuery.eq("requester", query.requester);
  }

  if (query.category) {
    cardQuery = cardQuery.eq("category_slug", query.category);
  }

  if (query.q) {
    const q = escapeIlike(query.q);
    cardQuery = cardQuery.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }

  if (cardIds) {
    cardQuery = cardQuery.in("id", cardIds);
  }

  if (query.sort === "pr_number") {
    cardQuery = cardQuery.order("pr_number", { ascending: false });
  } else {
    cardQuery = cardQuery.order("created_at", { ascending: false });
  }

  const { data, error, count } = await cardQuery.range(from, to);

  if (error) {
    throw error;
  }

  const items = await hydrateCardTagSlugs((data ?? []).map((row) => mapReviewCardListItem(row)));

  if (query.sort === "tag_count") {
    items.sort((a, b) => b.tags.length - a.tags.length || b.prNumber - a.prNumber);
  }

  return {
    items,
    page,
    limit,
    total: count ?? 0
  };
}

export async function getCardById(cardId: string): Promise<ReviewCardDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("review_card_details")
    .select("*")
    .eq("id", cardId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const [card] = await hydrateCardTagSlugs([mapReviewCardDetail(data)]);

  return card;
}

export async function getRandomCard(filters: Pick<CardsQuery, "mission" | "category"> = {}) {
  const result = await getCards({
    ...filters,
    page: 1,
    limit: MAX_LIMIT,
    sort: "latest"
  });

  if (result.items.length === 0) {
    return null;
  }

  return result.items[Math.floor(Math.random() * result.items.length)];
}

export async function getTagRankings({
  mission,
  limit = DEFAULT_LIMIT
}: {
  mission?: string;
  limit?: number;
} = {}): Promise<TagRankItem[]> {
  const cards = await getRankingRows(mission);
  const tagCounts = new Map<string, TagRankItem>();

  cards.forEach((card) => {
    (card.tags ?? []).forEach((tag) => {
      const tagName = getTagName(tag);

      if (!tagName) {
        return;
      }

      const key = tagName;
      const current = tagCounts.get(key) ?? {
        tagSlug: getTagSlug(tag) ?? tagName,
        tagName,
        cardCount: 0
      };

      current.cardCount += 1;
      tagCounts.set(key, current);
    });
  });

  const slugByName = await getTagSlugByName([...tagCounts.values()].map((tag) => tag.tagName));

  return [...tagCounts.values()]
    .map((tag) => ({
      ...tag,
      tagSlug: slugByName.get(tag.tagName) ?? tag.tagSlug
    }))
    .sort((a, b) => b.cardCount - a.cardCount || a.tagName.localeCompare(b.tagName))
    .slice(0, clampLimit(limit));
}

export async function getProgressRankings({
  mission,
  limit = DEFAULT_LIMIT
}: {
  mission?: string;
  limit?: number;
} = {}): Promise<ProgressRankItem[]> {
  const cards = await getRankingRows(mission);
  const requesterStats = new Map<
    string,
    {
      requester: string;
      totalCardCount: number;
      tags: Map<string, { slug: string; name: string; count: number }>;
    }
  >();

  cards.forEach((card) => {
    const current =
      requesterStats.get(card.requester) ??
      {
        requester: card.requester,
        totalCardCount: 0,
        tags: new Map<string, { slug: string; name: string; count: number }>()
      };

    current.totalCardCount += 1;
    (card.tags ?? []).forEach((tag) => {
      const tagName = getTagName(tag);

      if (!tagName) {
        return;
      }

      const tagSlug = getTagSlug(tag) ?? tagName;
      const tagStat = current.tags.get(tagName) ?? {
        slug: tagSlug,
        name: tagName,
        count: 0
      };

      tagStat.count += 1;
      current.tags.set(tagName, tagStat);
    });
    requesterStats.set(card.requester, current);
  });

  const slugByName = await getTagSlugByName(
    [...requesterStats.values()].flatMap((stat) => [...stat.tags.keys()])
  );

  return [...requesterStats.values()]
    .map((stat) => {
      const distinctTagCount = stat.tags.size;
      return {
        requester: stat.requester,
        totalCardCount: stat.totalCardCount,
        distinctTagCount,
        tagDiversityRatio: stat.totalCardCount === 0 ? 0 : distinctTagCount / stat.totalCardCount,
        topTags: [...stat.tags.values()]
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
          .slice(0, 3)
          .map((tag) => ({
            slug: slugByName.get(tag.name) ?? tag.slug,
            name: tag.name
          }))
      };
    })
    .sort(
      (a, b) =>
        b.distinctTagCount - a.distinctTagCount ||
        b.tagDiversityRatio - a.tagDiversityRatio ||
        b.totalCardCount - a.totalCardCount ||
        a.requester.localeCompare(b.requester)
    )
    .slice(0, clampLimit(limit));
}

async function getRankingRows(mission?: string): Promise<RankingCardRow[]> {
  const supabase = await createSupabaseServerClient();
  const pageSize = 1000;
  const rows: RankingCardRow[] = [];

  for (let page = 0; ; page += 1) {
    let query = supabase
      .from("review_card_details")
      .select("requester, tags")
      .eq("status", "published")
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (mission) {
      query = query.eq("mission_slug", mission);
    }

    const { data, error } = await query.returns<RankingCardRow[]>();

    if (error) {
      throw error;
    }

    rows.push(...(data ?? []));

    if (!data || data.length < pageSize) {
      break;
    }
  }

  return rows;
}

export async function getHomeSummary(): Promise<HomeSummary> {
  const [missions, categories, cards, topTags, topRequesters] = await Promise.all([
    getMissions(),
    getCategories(),
    getCards({ page: 1, limit: 6 }),
    getTagRankings({ limit: 10 }),
    getProgressRankings({ limit: 10 })
  ]);

  return {
    totalCardCount: cards.total,
    missionCardCounts: missions.map((mission) => ({
      missionSlug: mission.slug,
      missionName: mission.name,
      cardCount: mission.cardCount
    })),
    categoryCounts: categories.map((category) => ({
      categorySlug: category.slug,
      categoryName: category.name,
      cardCount: category.cardCount
    })),
    topTags,
    topRequesters,
    randomCards: cards.items.slice(0, 3)
  };
}
