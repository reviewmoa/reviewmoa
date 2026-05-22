import "server-only";

import { createHash } from "node:crypto";
import { generateReviewCards, type GeneratedReviewCard } from "@/lib/ai/reviewCardGenerator";
import { fetchPullRequestReviewData } from "@/lib/github/pullRequestReviews";
import type { GithubPullRequestReviewData, GithubReviewSource } from "@/lib/github/types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type MissionRow = {
  id: string;
  slug: string;
  name: string;
  owner: string;
  repo: string;
};

type PullRequestRow = {
  id: string;
};

type ReviewSourceRow = {
  id: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
};

type TagRow = {
  id: string;
  slug: string;
  name: string;
  normalized_name: string;
};

export type ProcessGenerationItemInput = {
  missionId: string;
  prNumber: number;
  githubToken: string;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
};

export type ProcessGenerationItemResult = {
  pullRequestId: string;
  cardCount: number;
};

const EXCLUDED_MINIMIZED_REASONS = new Set(["abuse", "spam", "off-topic", "duplicate", "low-quality"]);

export async function processGenerationJobItem(input: ProcessGenerationItemInput) {
  const mission = await getMission(input.missionId);

  if (!mission) {
    throw new Error("Mission not found");
  }

  const reviewData = await fetchPullRequestReviewData({
    owner: mission.owner,
    repo: mission.repo,
    prNumber: input.prNumber,
    token: input.githubToken
  });
  const pullRequestId = await upsertPullRequest(mission.id, reviewData);
  const sources = filterGeneratableSources(reviewData.sources);
  const storedSources = await replaceReviewSources(pullRequestId, sources);

  if (sources.length === 0) {
    return {
      pullRequestId,
      cardCount: 0
    };
  }

  const [existingCategories, existingTags] = await Promise.all([getCategoryNames(), getTagNames()]);
  await createReviewBundle(pullRequestId, reviewData, storedSources);
  const generated = await generateReviewCards({
    reviewData,
    sources: storedSources,
    existingCategories,
    existingTags,
    aiApiKey: input.aiApiKey,
    aiModel: input.aiModel,
    aiBaseUrl: input.aiBaseUrl
  });
  const cards = generated.cards.slice(0, 20);

  await archiveExistingCards(pullRequestId);

  for (let index = 0; index < cards.length; index += 1) {
    await upsertGeneratedCard({
      mission,
      pullRequestId,
      reviewData,
      card: cards[index],
      index
    });
  }

  return {
    pullRequestId,
    cardCount: cards.length
  };
}

async function getMission(missionId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("missions")
    .select("id, slug, name, owner, repo")
    .eq("id", missionId)
    .maybeSingle<MissionRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertPullRequest(missionId: string, reviewData: GithubPullRequestReviewData) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("pull_requests")
    .upsert(
      {
        mission_id: missionId,
        pr_number: reviewData.pullRequest.number,
        pr_url: reviewData.pullRequest.htmlUrl,
        requester: reviewData.pullRequest.requester,
        title: reviewData.pullRequest.title,
        state: reviewData.pullRequest.state,
        merged_at: reviewData.pullRequest.mergedAt
      },
      {
        onConflict: "mission_id,pr_number"
      }
    )
    .select("id")
    .single<PullRequestRow>();

  if (error) {
    throw error;
  }

  return data.id;
}

function filterGeneratableSources(sources: GithubReviewSource[]) {
  return sources.filter((source) => {
    if (!source.body.trim()) {
      return false;
    }

    if (!source.isMinimized) {
      return true;
    }

    return !source.minimizedReason || !EXCLUDED_MINIMIZED_REASONS.has(source.minimizedReason);
  });
}

async function replaceReviewSources(pullRequestId: string, sources: GithubReviewSource[]) {
  const supabase = createSupabaseServiceClient();
  const { error: deleteError } = await supabase
    .from("review_sources")
    .delete()
    .eq("pull_request_id", pullRequestId);

  if (deleteError) {
    throw deleteError;
  }

  if (sources.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("review_sources")
    .insert(
      sources.map((source) => ({
        pull_request_id: pullRequestId,
        source_type: source.sourceType,
        github_comment_id: source.githubCommentId,
        github_url: source.githubUrl,
        reviewer: source.reviewer,
        path: source.path,
        diff_hunk: source.diffHunk,
        body: source.body,
        is_resolved: source.isResolved,
        is_outdated: source.isOutdated,
        is_minimized: source.isMinimized,
        minimized_reason: source.minimizedReason
      }))
    )
    .select("id")
    .returns<ReviewSourceRow[]>();

  if (error) {
    throw error;
  }

  return sources.map((source, index) => ({
    ...source,
    id: data?.[index]?.id
  }));
}

async function createReviewBundle(
  pullRequestId: string,
  reviewData: GithubPullRequestReviewData,
  sources: Array<GithubReviewSource & { id?: string }>
) {
  const supabase = createSupabaseServiceClient();
  const promptInput = {
    pullRequest: {
      owner: reviewData.owner,
      repo: reviewData.repo,
      number: reviewData.pullRequest.number,
      title: reviewData.pullRequest.title,
      requester: reviewData.pullRequest.requester,
      url: reviewData.pullRequest.htmlUrl
    },
    sourceCount: sources.length,
    sourceIds: sources.map((source) => source.id).filter(Boolean)
  };
  const { data, error } = await supabase
    .from("review_bundles")
    .insert({
      pull_request_id: pullRequestId,
      topic: `pr-${reviewData.pullRequest.number}-review-feedback`,
      source_ids: sources.map((source) => source.id).filter(Boolean),
      conversation_count: sources.length,
      prompt_input: promptInput
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCategoryNames() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("categories").select("name").order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map((category) => category.name as string);
}

async function getTagNames() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("tags").select("name").order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map((tag) => tag.name as string);
}

async function archiveExistingCards(pullRequestId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("review_cards")
    .update({
      status: "archived",
      updated_at: new Date().toISOString()
    })
    .eq("pull_request_id", pullRequestId);

  if (error) {
    throw error;
  }
}

async function upsertGeneratedCard({
  mission,
  pullRequestId,
  reviewData,
  card,
  index
}: {
  mission: MissionRow;
  pullRequestId: string;
  reviewData: GithubPullRequestReviewData;
  card: GeneratedReviewCard;
  index: number;
}) {
  const supabase = createSupabaseServiceClient();
  const category = await findOrCreateCategory(card.category);
  const sourceKey = [
    "github",
    reviewData.owner,
    reviewData.repo,
    reviewData.pullRequest.number,
    "card",
    index + 1
  ].join(":");
  const { data, error } = await supabase
    .from("review_cards")
    .upsert(
      {
        source_key: sourceKey,
        mission_id: mission.id,
        pull_request_id: pullRequestId,
        category_id: category.id,
        requester: card.requester_id || reviewData.pullRequest.requester,
        reviewer_ids: card.reviewer_ids,
        conversation_count: card.conversation_count,
        title: card.title,
        summary: card.summary,
        problem: card.problem,
        reason: card.reason,
        solution: card.solution,
        rule: card.rule,
        markdown: card.markdown,
        bad_code: card.bad_code,
        good_code: card.good_code,
        code_language: card.code_language ?? "text",
        source_pr_url: reviewData.pullRequest.htmlUrl,
        pr_number: reviewData.pullRequest.number,
        status: "published",
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "source_key"
      }
    )
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw error;
  }

  await replaceCardTags(data.id, card.tags);
}

async function findOrCreateCategory(name: string) {
  const supabase = createSupabaseServiceClient();
  const trimmedName = name.trim();
  const { data: existing, error: existingError } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("name", trimmedName)
    .maybeSingle<CategoryRow>();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug: stableSlug(trimmedName, "category"),
      name: trimmedName
    })
    .select("id, slug, name")
    .single<CategoryRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function replaceCardTags(reviewCardId: string, tagNames: string[]) {
  const supabase = createSupabaseServiceClient();
  const { error: deleteError } = await supabase
    .from("review_card_tags")
    .delete()
    .eq("review_card_id", reviewCardId);

  if (deleteError) {
    throw deleteError;
  }

  const tags = await Promise.all(tagNames.slice(0, 3).map((tagName) => findOrCreateTag(tagName)));

  if (tags.length === 0) {
    throw new Error("Generated review card must have at least one tag");
  }

  const { error } = await supabase.from("review_card_tags").insert(
    tags.map((tag, index) => ({
      review_card_id: reviewCardId,
      tag_id: tag.id,
      sort_order: index + 1
    }))
  );

  if (error) {
    throw error;
  }
}

async function findOrCreateTag(name: string) {
  const supabase = createSupabaseServiceClient();
  const trimmedName = name.trim();
  const normalizedName = normalizeTagName(trimmedName);
  const { data: existing, error: existingError } = await supabase
    .from("tags")
    .select("id, slug, name, normalized_name")
    .eq("normalized_name", normalizedName)
    .maybeSingle<TagRow>();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({
      slug: stableSlug(trimmedName, "tag"),
      name: trimmedName
    })
    .select("id, slug, name, normalized_name")
    .single<TagRow>();

  if (error) {
    throw error;
  }

  return data;
}

function normalizeTagName(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function stableSlug(value: string, prefix: string) {
  const ascii = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) {
    return ascii;
  }

  return `${prefix}-${hash(value).slice(0, 10)}`;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
