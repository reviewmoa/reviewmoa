# ReviewMoa API Spec

이 문서는 프론트엔드와 백엔드가 병렬로 작업하기 위한 API 계약이다.

## 기본 원칙

- 공개 화면은 `/api/*` 공개 조회 API를 사용한다.
- 관리자 화면은 `/api/admin/*` API를 사용한다.
- `/api/admin/*`는 Supabase Auth 세션과 `admin_users` allowlist를 통과한 사용자만 접근할 수 있다.
- `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN`, `AI_API_KEY`는 서버 route handler 내부에서만 사용한다.
- 리뷰 원문 diff 전체는 API 응답으로 내려주지 않는다.
- 리뷰카드 1개는 category 1개만 가진다.
- 리뷰카드 tags는 1~3개만 가진다.

## 공통 응답 형식

성공:

```ts
type ApiSuccess<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};
```

실패:

```ts
type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
```

권장 HTTP status:

- `200`: 조회 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 로그인 필요
- `403`: 관리자 권한 없음
- `404`: 리소스 없음
- `409`: 중복 또는 충돌
- `500`: 서버 오류

## 공통 타입

```ts
type MissionSummary = {
  id: string;
  slug: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  prBaseUrl: string;
  cardCount: number;
};

type CardTag = {
  slug: string;
  name: string;
  sortOrder: number;
};

type ReviewCardListItem = {
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

type TagRankItem = {
  tagSlug: string;
  tagName: string;
  cardCount: number;
};

type ProgressRankItem = {
  requester: string;
  totalCardCount: number;
  distinctTagCount: number;
  tagDiversityRatio: number;
  topTags: Array<{
    slug: string;
    name: string;
  }>;
};
```

## Public API

### `GET /api/health`

서버와 DB 연결 상태 확인용 API다.

Response:

```ts
{
  data: {
    ok: boolean;
  };
}
```

### `GET /api/home/summary`

홈 화면 요약 데이터를 조회한다.

Response:

```ts
{
  data: {
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
}
```

### `GET /api/missions`

미션 목록을 조회한다.

Query:

```ts
{
  active?: "true" | "false"; // default: "true"
}
```

Response:

```ts
{
  data: MissionSummary[];
}
```

### `GET /api/missions/[missionSlug]/requesters`

특정 미션의 PR 요청자 목록을 조회한다.

Response:

```ts
{
  data: Array<{
    requester: string;
    prCount: number;
    cardCount: number;
    distinctTagCount: number;
  }>;
}
```

### `GET /api/categories`

카테고리 목록을 조회한다.

Response:

```ts
{
  data: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    cardCount: number;
  }>;
}
```

### `GET /api/cards`

리뷰카드 목록을 조회한다.

Query:

```ts
{
  mission?: string;   // mission slug
  requester?: string;
  category?: string;  // category slug
  tags?: string;      // comma separated tag slugs
  q?: string;         // title/summary lightweight search
  page?: string;      // default: "1"
  limit?: string;     // default: "20", max: "50"
  sort?: "latest" | "pr_number" | "tag_count";
}
```

Example:

```text
GET /api/cards?mission=roomescape-member&requester=some-user&page=1&limit=20
GET /api/cards?category=object-oriented&tags=responsibility,separation
```

Response:

```ts
{
  data: ReviewCardListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### `GET /api/cards/[cardId]`

리뷰카드 상세를 조회한다.

Response:

```ts
{
  data: {
    id: string;
    title: string;
    summary: string;
    problem: string;
    reason: string;
    solution: string;
    rule: string | null;
    markdown: string | null;
    badCode: string | null;
    goodCode: string | null;
    codeLanguage: string;
    requester: string;
    reviewerIds: string[];
    conversationCount: number;
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
  };
}
```

### `GET /api/random-card`

랜덤 리뷰카드 1개를 조회한다.

Query:

```ts
{
  mission?: string;   // mission slug
  category?: string;  // category slug
}
```

Response:

```ts
{
  data: ReviewCardListItem;
}
```

### `GET /api/rankings/tags`

태그 랭킹을 조회한다.

Query:

```ts
{
  mission?: string; // mission slug
  limit?: string;   // default: "20"
}
```

Response:

```ts
{
  data: TagRankItem[];
}
```

### `GET /api/rankings/progress`

발전률 랭킹을 조회한다.

정렬 기준:

1. 요청자별 distinct tag 수 내림차순
2. tag diversity ratio 내림차순
3. 총 카드 수 내림차순

`tagDiversityRatio = distinctTagCount / totalCardCount`

Query:

```ts
{
  mission?: string; // mission slug
  limit?: string;   // default: "20"
}
```

Response:

```ts
{
  data: ProgressRankItem[];
}
```

## Admin API

모든 관리자 API는 인증된 관리자만 호출할 수 있다.

관리자 판별:

1. Supabase Auth session 확인
2. session user email을 `admin_users.email`에서 조회
3. 등록된 관리자일 때만 요청 처리

### `GET /api/admin/me`

현재 사용자의 관리자 여부를 확인한다.

Response:

```ts
{
  data: {
    email: string;
    isAdmin: boolean;
  };
}
```

### `GET /api/admin/missions`

관리자 미션 목록을 조회한다. 비활성 미션도 포함한다.

Response:

```ts
{
  data: Array<{
    id: string;
    slug: string;
    name: string;
    githubOwner: string;
    githubRepo: string;
    prBaseUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### `POST /api/admin/missions`

미션을 등록한다.

Request:

```ts
{
  slug: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  prBaseUrl: string;
  isActive?: boolean;
}
```

Validation:

- `slug`는 unique여야 한다.
- `slug`, `name`, `githubOwner`, `githubRepo`, `prBaseUrl`은 필수다.
- `prBaseUrl`은 GitHub PR URL prefix여야 한다.

Response:

```ts
{
  data: {
    id: string;
    slug: string;
    name: string;
    githubOwner: string;
    githubRepo: string;
    prBaseUrl: string;
    isActive: boolean;
  };
}
```

### `PATCH /api/admin/missions/[missionId]`

미션 정보를 수정한다.

Request:

```ts
{
  name?: string;
  githubOwner?: string;
  githubRepo?: string;
  prBaseUrl?: string;
  isActive?: boolean;
}
```

Response:

```ts
{
  data: {
    id: string;
    slug: string;
    name: string;
    githubOwner: string;
    githubRepo: string;
    prBaseUrl: string;
    isActive: boolean;
  };
}
```

### `POST /api/admin/generation-jobs`

리뷰카드 생성 작업을 등록한다.

Request:

```ts
{
  missionId: string;
  prStart: number;
  prEnd: number;
  excludedPrNumbers?: number[];
}
```

Validation:

- `missionId`는 존재하는 미션이어야 한다.
- `prStart <= prEnd`여야 한다.
- MVP 기준 처리 범위는 최대 100개 PR로 제한한다.
- `excludedPrNumbers`는 `prStart`와 `prEnd` 사이의 숫자만 허용한다.
- `totalPrCount = prEnd - prStart + 1 - excludedPrNumbers.length`

Response:

```ts
{
  data: {
    id: string;
    missionId: string;
    status: "pending";
    prStart: number;
    prEnd: number;
    excludedPrNumbers: number[];
    totalPrCount: number;
  };
}
```

### `GET /api/admin/generation-jobs`

생성 작업 목록을 조회한다.

Query:

```ts
{
  status?: "pending" | "running" | "completed" | "failed" | "partial_failed";
  page?: string;  // default: "1"
  limit?: string; // default: "20"
}
```

Response:

```ts
{
  data: Array<{
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
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### `GET /api/admin/generation-jobs/[jobId]`

생성 작업 상세와 PR별 처리 결과를 조회한다.

Response:

```ts
{
  data: {
    id: string;
    mission: {
      id: string;
      slug: string;
      name: string;
    };
    status: "pending" | "running" | "completed" | "failed" | "partial_failed";
    prStart: number;
    prEnd: number;
    excludedPrNumbers: number[];
    totalPrCount: number;
    successPrCount: number;
    failedPrCount: number;
    resultCardCount: number;
    errorSummary: string | null;
    items: Array<{
      id: string;
      prNumber: number;
      status: "pending" | "running" | "completed" | "failed" | "skipped";
      cardCount: number;
      errorMessage: string | null;
    }>;
  };
}
```

### `POST /api/admin/generation-jobs/[jobId]/retry`

실패한 PR item을 재시도 대상으로 되돌린다.

Request:

```ts
{
  prNumbers?: number[]; // 없으면 failed 전체 재시도
}
```

Response:

```ts
{
  data: {
    jobId: string;
    retriedPrNumbers: number[];
    status: "pending";
  };
}
```

## Internal API

프론트엔드는 호출하지 않는다. 서버 worker, cron, 운영 스크립트만 호출한다.

### `POST /api/internal/generation-jobs/[jobId]/run`

생성 작업을 실제로 실행한다.

Auth:

```text
Authorization: Bearer ${INTERNAL_JOB_SECRET}
```

역할:

- `pending` job을 `running`으로 변경
- GitHub PR 리뷰 수집
- `review_sources` 저장
- `review_bundles` 생성
- AI 리뷰카드 생성
- `review_cards`, `review_card_tags` idempotent upsert
- `generation_job_items` 갱신
- job 최종 상태를 `completed`, `failed`, `partial_failed` 중 하나로 변경

주의:

- 이 API는 service role key, GitHub token, AI key를 사용할 수 있다.
- 브라우저나 공개 프론트 코드에서 호출하면 안 된다.
- 생성 에이전트는 DB에 직접 저장하지 않고 JSON 또는 job item 결과만 만든다.

## 프론트 우선 연동 순서

1. `GET /api/missions`
2. `GET /api/cards`
3. `GET /api/cards/[cardId]`
4. `GET /api/categories`
5. `GET /api/rankings/tags`
6. `GET /api/rankings/progress`
7. `GET /api/random-card`
8. 관리자 화면은 `GET /api/admin/me` 이후 `/api/admin/*` 연결
