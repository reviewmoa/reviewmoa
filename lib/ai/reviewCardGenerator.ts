import "server-only";

import { z } from "zod";
import type { GithubPullRequestReviewData, GithubReviewSource } from "@/lib/github/types";

export const generatedReviewCardSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1).max(3),
  reviewer_ids: z.array(z.string()).default([]),
  requester_id: z.string().min(1),
  conversation_count: z.number().int().nonnegative(),
  markdown: z.string().nullable().default(null),
  problem: z.string().min(1),
  reason: z.string().min(1),
  solution: z.string().min(1),
  rule: z.string().nullable().default(null),
  summary: z.string().min(1),
  bad_code: z.string().nullable().default(null),
  good_code: z.string().nullable().default(null),
  code_language: z.string().nullable().default("text")
});

export const generatedReviewCardsSchema = z.object({
  cards: z.array(generatedReviewCardSchema).default([]),
  new_categories: z.array(z.string()).default([])
});

export type GeneratedReviewCard = z.infer<typeof generatedReviewCardSchema>;
export type GeneratedReviewCards = z.infer<typeof generatedReviewCardsSchema>;

type GenerateReviewCardsInput = {
  reviewData: GithubPullRequestReviewData;
  sources: Array<GithubReviewSource & { id?: string }>;
  existingCategories: string[];
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      refusal?: string | null;
    };
  }>;
};

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          tags: {
            type: "array",
            minItems: 1,
            maxItems: 3,
            items: { type: "string" }
          },
          reviewer_ids: {
            type: "array",
            items: { type: "string" }
          },
          requester_id: { type: "string" },
          conversation_count: { type: "number" },
          markdown: { type: ["string", "null"] },
          problem: { type: "string" },
          reason: { type: "string" },
          solution: { type: "string" },
          rule: { type: ["string", "null"] },
          summary: { type: "string" },
          bad_code: { type: ["string", "null"] },
          good_code: { type: ["string", "null"] },
          code_language: { type: ["string", "null"] }
        },
        required: [
          "title",
          "category",
          "tags",
          "reviewer_ids",
          "requester_id",
          "conversation_count",
          "markdown",
          "problem",
          "reason",
          "solution",
          "rule",
          "summary",
          "bad_code",
          "good_code",
          "code_language"
        ]
      }
    },
    new_categories: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["cards", "new_categories"]
};

export async function generateReviewCards(input: GenerateReviewCardsInput) {
  const payload = buildPromptPayload(input.reviewData, input.sources, input.existingCategories);
  const response = await fetch(`${input.aiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.aiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: input.aiModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "너는 GitHub PR 리뷰를 학습용 리뷰카드로 변환하는 백엔드 생성기다. 반드시 JSON schema에 맞춰 한국어로만 응답한다."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "review_card_generation",
          strict: true,
          schema: RESPONSE_SCHEMA
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`AI API request failed: ${response.status} ${await response.text()}`);
  }

  const completion = (await response.json()) as ChatCompletionResponse;
  const message = completion.choices?.[0]?.message;

  if (message?.refusal) {
    throw new Error(`AI refused review card generation: ${message.refusal}`);
  }

  if (!message?.content) {
    throw new Error("AI returned empty review card generation response");
  }

  return generatedReviewCardsSchema.parse(JSON.parse(message.content));
}

function buildPromptPayload(
  reviewData: GithubPullRequestReviewData,
  sources: Array<GithubReviewSource & { id?: string }>,
  existingCategories: string[]
) {
  return {
    task: "GitHub PR 리뷰에서 재사용 가능한 리뷰카드를 생성한다.",
    constraints: [
      "단순 칭찬, 단순 확인 답변, 맥락 없는 질문은 카드로 만들지 않는다.",
      "카드 1개는 category 1개만 가진다.",
      "tags는 1~3개이며 중요도 순서로 둔다.",
      "실제 리뷰에 나온 문제 코드만 짧게 발췌한다. diff 전체를 옮기지 않는다.",
      "bad_code와 good_code는 실제 맥락이 있을 때만 10줄 이하로 작성한다.",
      "기존 카테고리를 우선 사용한다."
    ],
    existingCategories,
    pullRequest: {
      owner: reviewData.owner,
      repo: reviewData.repo,
      number: reviewData.pullRequest.number,
      title: reviewData.pullRequest.title,
      requester: reviewData.pullRequest.requester,
      url: reviewData.pullRequest.htmlUrl
    },
    sources: sources.map((source, index) => ({
      id: source.id ?? `source-${index + 1}`,
      sourceType: source.sourceType,
      reviewer: source.reviewer,
      path: source.path,
      githubUrl: source.githubUrl,
      isResolved: source.isResolved,
      isOutdated: source.isOutdated,
      isMinimized: source.isMinimized,
      minimizedReason: source.minimizedReason,
      body: truncate(source.body, 1800),
      diffHunk: source.diffHunk ? truncate(source.diffHunk, 1200) : null
    }))
  };
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
