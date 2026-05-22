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
  markdown: z.string().min(1),
  problem: z.string().min(1),
  reason: z.string().min(1),
  solution: z.string().min(1),
  rule: z.string().min(1),
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
  existingTags: string[];
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
          markdown: { type: "string" },
          problem: { type: "string" },
          reason: { type: "string" },
          solution: { type: "string" },
          rule: { type: "string" },
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
  const payload = buildPromptPayload(
    input.reviewData,
    input.sources,
    input.existingCategories,
    input.existingTags
  );
  const response = await fetch(`${input.aiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.aiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: input.aiModel,
      messages: [
        {
          role: "system",
          content: [
            "너는 시니어 백엔드 엔지니어이자 코드 리뷰 분석가다.",
            "GitHub PR 리뷰 묶음에서 다른 프로젝트에서도 재사용할 수 있는 학습용 리뷰카드를 추출한다.",
            "반드시 JSON schema에 맞춰 한국어로만 응답하고, 입력 리뷰에 없는 사실을 만들지 않는다."
          ].join(" ")
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
  existingCategories: string[],
  existingTags: string[]
) {
  return {
    task: "GitHub PR 리뷰에서 재사용 가능한 리뷰카드를 생성한다.",
    outputContract: {
      format: "JSON schema",
      fieldMapping: {
        category: "DB에 저장할 category_name이다. 기존 카테고리와 의미가 맞으면 기존 이름을 그대로 사용한다.",
        tags: "DB에 저장할 tag name 배열이다. 1~3개만 작성하고 중요도 순서대로 둔다.",
        markdown:
          "카드 본문 전체를 마크다운 템플릿 형식으로 작성한다. JSON의 problem/reason/solution/rule/summary와 의미가 일치해야 한다.",
        problem: ":boom: 어떤 문제가 있었나? 섹션의 본문만 작성한다.",
        reason: ":fire: 왜 문제인가? 섹션의 본문만 작성한다.",
        solution: ":white_check_mark: 어떻게 해야 하나? 섹션의 본문만 작성한다.",
        rule: ":pushpin: 규칙에 들어갈 If-Then 한 문장이다.",
        summary: ":brain: 한 줄 요약 섹션의 한 문장이다.",
        bad_code: "문제 코드 블록의 코드만 작성한다. 없으면 null이다.",
        good_code: "올바른 코드 블록의 코드만 작성한다. 없으면 null이다."
      }
    },
    extractionRules: {
      ignore: [
        "단순 칭찬, 단순 확인 답변, 맥락 없는 질문은 카드로 만들지 않는다.",
        "프로젝트에만 종속되는 지엽적 사실만 있는 리뷰는 카드로 만들지 않는다.",
        "리뷰 원문 diff 전체를 옮기지 않는다."
      ],
      splitMergeMatrix: [
        "What(문제)이 같고 How(해결방향)가 같으면 하나의 카드로 병합한다.",
        "What은 같지만 How가 다르면 카드를 분리하고 제목에 해결 방향 차이가 드러나게 쓴다.",
        "What이 비슷하고 How가 같으면 병합하고 제목을 상위 개념으로 추상화한다.",
        "What이 다르고 서로 무관하면 무조건 분리한다."
      ],
      abstraction: [
        "특정 도메인명, 클래스명, 미션명에 갇히지 말고 레이어명, 역할, 행위 중심으로 추상화한다.",
        "규칙의 상황과 행동은 Level 2 수준으로 작성한다. 예: '서비스 레이어에 도메인 규칙 검증이 있으면'.",
        "너무 추상적인 표현인 '로직이 잘못된 곳에 있으면'처럼 쓰지 않는다."
      ]
    },
    categoryRules: {
      constraints: [
        "카드 1개는 category 1개만 가진다.",
        "카테고리는 가장 큰 문제 영역을 나타내는 한글 명사구다.",
        "기존 카테고리 목록과 의미가 맞으면 기존 카테고리를 재사용한다.",
        "새 카테고리는 좁은 구현 기술명보다 여러 카드가 공유할 수 있는 큰 분류로 만든다."
      ],
      examples: [
        "API 설계: 요청/응답 구조, HTTP 상태 코드, REST 자원 설계, Controller 계약",
        "객체지향: 책임 분리, 캡슐화, 응집도, 도메인 모델링, 값 객체",
        "예외처리: 커스텀 예외, 예외 발생 위치, 예외 메시지, 에러 응답",
        "테스트: 테스트 격리, 픽스처, 단위/통합 테스트 경계, 테스트명",
        "아키텍처: 레이어 경계, 트랜잭션 경계, 의존성 방향, 패키지 구조",
        "데이터 접근: Repository, JPA, 쿼리, 영속성 컨텍스트, N+1",
        "네이밍: 메서드/클래스/변수명, 도메인 언어, 불리언 이름",
        "성능: 불필요한 반복, 캐싱, 쿼리 수, 자료구조 선택",
        "동시성: 락, 원자성, race condition, 재시도 전략"
      ]
    },
    tagRules: {
      constraints: [
        "tags는 최소 1개, 최대 3개이며 중요도 순서대로 작성한다.",
        "기존 태그와 반드시 같을 필요는 없지만 비슷한 리뷰에서는 비슷한 태그가 나오도록 한다.",
        "태그는 한글 명사구를 기본으로 하고 DTO, JPA, N+1, SRP 같은 널리 쓰이는 약어는 그대로 둔다.",
        "설계, 코드, 로직, 개선처럼 너무 넓은 단어만 단독으로 쓰지 않는다.",
        "예약, 쿠폰, 자동차처럼 특정 도메인명보다 재사용 가능한 개념을 우선한다.",
        "같은 카드 안에서 카테고리명과 완전히 같은 태그만 반복하지 않는다."
      ],
      priority: [
        "1. 리뷰어가 직접 지적한 핵심 개념",
        "2. 문제가 발생한 설계 원칙 또는 경계",
        "3. 수정 방향을 대표하는 구현 개념"
      ],
      normalizationExamples: [
        "View에서 검증하면 안 된다 -> 책임 분리, 도메인 검증",
        "RuntimeException 말고 의미 있는 예외를 쓰자 -> 커스텀 예외",
        "테스트가 순서에 의존한다 -> 테스트 격리, 픽스처",
        "Repository가 Controller DTO를 받는다 -> 레이어 경계, DTO 변환",
        "boolean 메서드 이름이 모호하다 -> 불리언 네이밍"
      ]
    },
    codeRules: [
      "bad_code는 실제 리뷰 또는 diff에 있는 문제 핵심 코드만 최대 10줄로 발췌한다.",
      "AI 판단으로 문제 코드를 새로 만들지 않는다. 코드가 없으면 null로 둔다.",
      "good_code는 실제 문제가 된 코드의 형식을 최대한 유지하면서 문제가 되는 부분만 수정한 방향으로 작성한다.",
      "good_code를 만들 근거가 부족하면 null로 둔다.",
      "코드가 어느 클래스/파일의 맥락인지 알 수 있으면 코드 첫 줄 주석에 표시한다."
    ],
    toneRules: [
      "모든 서술 텍스트는 시니어 멘토가 후배 개발자에게 설명하는 말투로 쓴다.",
      "문장 종결은 '~하는 게 좋아요', '~해보세요', '~하거든요', '~거예요'를 기본으로 한다.",
      "'~함', '~됨', '~해야 합니다' 같은 딱딱한 명사형/보고서체 종결을 쓰지 않는다.",
      "SRP, OCP 같은 원칙 이름은 유지하되 괄호나 뒤 문장으로 짧게 풀어준다.",
      "'반드시', '절대', '무조건' 같은 단정보다는 이유가 담긴 표현으로 쓴다."
    ],
    sectionRules: [
      "problem은 잘못 구현된 현상만 1~2문장으로 쓴다. 왜 나쁜지, 어떻게 고칠지는 쓰지 않는다.",
      "reason은 위반한 설계 원칙, 트레이드오프, 유지보수 비용만 1~2문장으로 쓴다. 현상 재서술과 해결 방향은 쓰지 않는다.",
      "solution은 올바른 구현 방향만 1~2문장으로 쓴다. 문제와 원인을 다시 설명하지 않는다.",
      "rule은 '[Condition] 이면 → [Action]하는 게 좋아요.' 형태로 작성한다.",
      "summary는 핵심 교훈을 멘토가 건네듯 한 문장으로 작성한다."
    ],
    markdownTemplate: [
      ":card_index_dividers: 규칙 카드: [title]",
      "",
      ":boom: 어떤 문제가 있었나?",
      "[problem]",
      "",
      "```[code_language]",
      "// :x: 문제 코드 (bad_code가 null이면 이 코드 블록 전체를 생략)",
      "[bad_code]",
      "```",
      "",
      ":fire: 왜 문제인가?",
      "[reason]",
      "",
      ":white_check_mark: 어떻게 해야 하나?",
      "[solution]",
      "",
      "```[code_language]",
      "// :white_check_mark: 올바른 코드 (good_code가 null이면 이 코드 블록 전체를 생략)",
      "[good_code]",
      "```",
      "",
      ":pushpin: 규칙",
      "[rule]",
      "",
      ":brain: 한 줄 요약",
      "[summary]"
    ].join("\n"),
    fewShotExamples: [
      {
        input:
          "InputView에서 split과 검증까지 하고 있네요. View는 입출력만 담당해야 합니다. 데이터 가공과 검증은 도메인 객체 생성자에서 처리하는 것이 맞습니다.",
        output: {
          title: "UI와 도메인의 책임 분리",
          category: "객체지향",
          tags: ["책임 분리", "도메인 검증"],
          problem: "UI 계층에서 사용자 입력값을 가공하고 유효성 검증까지 같이 하고 있었어요.",
          reason:
            "View가 도메인 규칙을 알게 되면 SRP(단일 책임 원칙)를 어기게 되거든요. 나중에 다른 입력 환경에서 도메인을 재사용하려고 할 때 View가 발목을 잡아요.",
          solution:
            "View는 원시 문자열만 돌려주고, 가공과 검증은 도메인 객체의 생성자나 팩토리 메서드한테 맡기는 게 훨씬 깔끔해요.",
          rule: "UI 계층에서 입력값 가공이나 도메인 규칙 검증을 하고 있으면 → 원시값 반환만 남기고 가공과 검증은 도메인 객체로 옮기는 게 좋아요.",
          summary: "View는 입출력만 하고, 검증이랑 가공은 도메인한테 맡기자."
        }
      },
      {
        input: "Repository 메서드가 Controller 요청 DTO를 그대로 받고 있어요. Service에서 도메인 객체로 변환해서 넘겨주세요.",
        output: {
          title: "레이어 경계를 지키는 DTO 변환",
          category: "아키텍처",
          tags: ["레이어 경계", "DTO 변환"],
          problem: "Repository가 웹 계층의 요청 DTO를 그대로 파라미터로 받고 있었어요.",
          reason:
            "웹 계층의 DTO가 영속성 계층까지 내려가면 레이어 경계가 흐려지거든요. 요청 형식이 바뀔 때 Repository까지 같이 흔들릴 수 있어요.",
          solution:
            "Service에서 요청 DTO를 도메인 객체나 조회 조건으로 변환한 뒤 Repository에는 도메인 언어만 넘겨보세요.",
          rule: "Repository가 Controller DTO를 직접 받고 있으면 → Service에서 도메인 객체나 조회 조건으로 변환해서 넘기는 게 좋아요.",
          summary: "DTO는 필요한 경계까지만 내려가고, Repository는 도메인 언어로 대화하게 하자."
        }
      }
    ],
    existingCategories,
    existingTags: existingTags.slice(0, 300),
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
