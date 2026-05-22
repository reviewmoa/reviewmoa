import type { CategoryName, Mission, RuleCard } from "@/types";

export const CATS: Record<CategoryName, { color: string; emoji: string }> = {
  "레이어 분리": { color: "teal", emoji: "🧱" },
  객체지향: { color: "purple", emoji: "🧩" },
  네이밍: { color: "blue", emoji: "🔤" },
  예외처리: { color: "amber", emoji: "⚠️" },
  테스트: { color: "green", emoji: "🧪" },
  아키텍처: { color: "accent", emoji: "🏛️" }
};

export const COLOR_VARS: Record<string, [string, string]> = {
  teal: ["var(--teal)", "var(--teal-soft)"],
  purple: ["var(--purple)", "var(--purple-soft)"],
  blue: ["var(--blue)", "var(--blue-soft)"],
  amber: ["var(--amber)", "var(--amber-soft)"],
  green: ["var(--green)", "var(--green-soft)"],
  accent: ["var(--accent)", "var(--accent-soft)"],
  red: ["var(--red)", "var(--red-soft)"]
};

export const CATEGORY_SLUGS: Record<CategoryName, string> = {
  "레이어 분리": "layer-separation",
  객체지향: "object-oriented",
  네이밍: "naming",
  예외처리: "exception-handling",
  테스트: "test",
  아키텍처: "architecture"
};

export const MISSIONS: Mission[] = [
  {
    id: "m1",
    level: 1,
    name: "roomescape-member",
    repo: "spring-roomescape-member",
    cards: 1204,
    requesters: 38,
    prRange: "12-455",
    tags: ["레이어 분리", "객체지향"]
  },
  {
    id: "m2",
    level: 2,
    name: "shopping-order",
    repo: "spring-shopping-order",
    cards: 982,
    requesters: 34,
    prRange: "8-390",
    tags: ["도메인 설계", "JPA"]
  },
  {
    id: "m3",
    level: 2,
    name: "coupon",
    repo: "java-coupon",
    cards: 661,
    requesters: 26,
    prRange: "5-240",
    tags: ["설계", "동시성"]
  }
];

export const TAG_RANK: Record<string, [string, number][]> = {
  m1: [
    ["책임 분리", 142],
    ["도메인 검증", 118],
    ["SRP", 96],
    ["DTO 변환", 81],
    ["커스텀 예외", 64],
    ["네이밍", 52]
  ],
  m2: [
    ["연관관계", 124],
    ["트랜잭션", 103],
    ["도메인 검증", 88],
    ["N+1", 72],
    ["책임 분리", 58],
    ["예외 응집도", 44]
  ],
  m3: [
    ["동시성", 88],
    ["락 전략", 71],
    ["책임 분리", 55],
    ["도메인 검증", 48],
    ["네이밍", 33],
    ["테스트 격리", 27]
  ]
};

export const CARDS: RuleCard[] = [
  {
    id: "c1",
    mission: "m1",
    cat: "레이어 분리",
    tags: ["책임 분리", "도메인 검증", "View"],
    requester: "jinkshower",
    reviewers: ["hyunta"],
    conv: 2,
    title: "UI와 도메인의 책임 분리",
    summary: "View는 입출력만 하고, 검증이랑 가공은 도메인한테 맡기자.",
    problem:
      "UI 계층(View)에서 사용자 입력값을 split으로 가공하고 유효성 검증까지 같이 하고 있었어요.",
    reason:
      "View가 도메인 규칙을 알게 되면 SRP(단일 책임 원칙)를 어기게 되거든요. 나중에 다른 입력 환경에서 도메인을 재사용하려고 할 때 View가 발목을 잡아요.",
    solution:
      "View는 원시 문자열(Raw String)만 돌려주고, 가공과 검증은 도메인 객체의 생성자나 팩토리 메서드한테 맡기는 게 훨씬 깔끔해요.",
    badCode:
      "public List<String> readNames() {\n    String input = scanner.nextLine();\n    if (input.isEmpty()) throw new IllegalArgumentException();\n    return Arrays.asList(input.split(\",\"));\n}",
    goodCode: "public String readNames() {\n    return scanner.nextLine();\n}",
    rules: [
      [
        "UI 계층에서 입력값을 가공하거나 도메인 규칙을 검증하고 있을 때",
        "원시값 반환만 남기고 가공/검증은 도메인 객체로 옮기는 게 좋아요."
      ]
    ],
    pr: 455
  },
  {
    id: "c2",
    mission: "m1",
    cat: "레이어 분리",
    tags: ["DTO 변환", "책임 분리"],
    requester: "jinkshower",
    reviewers: ["hyunta"],
    conv: 3,
    title: "Repository는 도메인 객체만 알아야 해요",
    summary: "Controller의 DTO는 Service까지만, Repository는 도메인 객체만 받자.",
    problem:
      "Repository 메서드 파라미터로 Controller의 요청 DTO가 그대로 흘러 들어가고 있었어요.",
    reason:
      "DTO가 Repository까지 내려가면 레이어 간 격리가 무너지거든요. 웹 계층이 바뀔 때마다 Repository까지 영향을 받게 돼요.",
    solution:
      "Service에서 DTO를 도메인 객체로 변환한 다음 Repository에 넘겨주세요. Repository는 도메인 언어로만 대화하는 게 좋아요.",
    badCode: "List<Theme> getPopular(PopularConditionRequest request);",
    goodCode: "List<Theme> getPopular(PopularThemeCondition condition);",
    rules: [
      [
        "Repository 메서드가 Controller DTO를 파라미터로 받고 있을 때",
        "Service에서 도메인 객체로 변환해서 넘기는 게 좋아요."
      ]
    ],
    pr: 455
  },
  {
    id: "c3",
    mission: "m1",
    cat: "객체지향",
    tags: ["도메인 검증", "응집도"],
    requester: "pobi",
    reviewers: ["hyunta", "dompoo"],
    conv: 2,
    title: "검증 로직은 도메인 객체 안에",
    summary: "도메인 규칙은 도메인 객체 스스로 지키게 하자.",
    problem:
      "도메인 객체 상태를 검증하고 예외를 던지는 로직이 서비스 레이어에 들어가 있었어요.",
    reason:
      "도메인 규칙은 도메인 객체 스스로 책임져야 하거든요. 서비스에 검증이 흩어지면 같은 규칙을 여러 곳에서 중복 검증하게 되고 응집도가 낮아져요.",
    solution:
      "도메인 객체가 생성되거나 상태가 바뀌는 시점에 스스로 불변식을 검증하도록, 검증 로직을 도메인 내부로 옮겨보세요.",
    badCode:
      "// ReservationService\nif (date.isBefore(LocalDate.now()))\n    throw new InvalidRequestException(PAST_DATE);",
    goodCode:
      "// Reservation 생성자\npublic Reservation(LocalDate date, ...) {\n    validateNotPast(date);\n}",
    rules: [
      [
        "서비스 레이어에서 도메인 객체의 상태를 검증하고 예외를 던지고 있을 때",
        "검증과 예외를 도메인 객체 내부로 옮기는 게 좋아요."
      ]
    ],
    pr: 461
  },
  {
    id: "c4",
    mission: "m1",
    cat: "예외처리",
    tags: ["커스텀 예외"],
    requester: "pobi",
    reviewers: ["dompoo"],
    conv: 1,
    title: "예외 타입 명시화",
    summary: "예외 이름 자체가 문서예요. 의미 있는 커스텀 예외를 던지자.",
    problem:
      "도메인 규칙이 위반됐을 때 RuntimeException 같은 범용 예외를 그냥 던지고 있었어요.",
    reason:
      "범용 예외는 이름만 봐서는 어떤 상황인지 알 수가 없거든요. 호출부에서 예외 종류별로 다르게 처리하고 싶어도 방법이 없어서 유지보수가 점점 힘들어져요.",
    solution:
      "도메인 규칙이 깨지는 상황마다 그 의미를 담은 커스텀 예외 클래스를 따로 만들어서 쓰는 게 좋아요.",
    badCode: 'if (reservation == null)\n    throw new RuntimeException("없음");',
    goodCode:
      "if (reservation == null)\n    throw new ReservationNotFoundException(id);",
    rules: [
      [
        "도메인 규칙 위반으로 예외를 던져야 할 때",
        "범용 예외 대신 상황을 명시하는 커스텀 예외 클래스를 정의해서 쓰는 게 좋아요."
      ]
    ],
    pr: 455
  },
  {
    id: "c5",
    mission: "m1",
    cat: "네이밍",
    tags: ["네이밍", "도메인 언어"],
    requester: "curl",
    reviewers: ["hyunta"],
    conv: 1,
    title: "메서드 이름은 도메인 언어로",
    summary:
      "코드는 비즈니스 언어로 말해야 해요. CRUD 용어 대신 도메인 용어를 쓰자.",
    problem:
      "예약 생성 메서드를 addReservation, 삭제를 deleteReservation으로 이름 붙이고 있었어요.",
    reason:
      'add/delete는 데이터 저장소 관점의 용어거든요. 비즈니스에서 예약은 "하고(book)" "취소(cancel)"하는 거지 추가·삭제하는 게 아니에요.',
    solution:
      "실제 비즈니스에서 그 행위를 뭐라고 부르는지 떠올려서, 도메인 언어로 메서드 이름을 지어보세요.",
    badCode: "public void addReservation(...)\npublic void deleteReservation(long id)",
    goodCode: "public void book(...)\npublic void cancel(long id)",
    rules: [
      [
        "Service 메서드 이름에 add/delete/update 같은 CRUD 용어를 쓰고 있을 때",
        "도메인에서 실제로 쓰는 행위 동사로 바꾸는 게 좋아요."
      ]
    ],
    pr: 455
  },
  {
    id: "c6",
    mission: "m2",
    cat: "객체지향",
    tags: ["연관관계", "캡슐화"],
    requester: "redibab",
    reviewers: ["kang"],
    conv: 2,
    title: "연관관계의 주인은 신중하게",
    summary: "양방향이 꼭 필요한지 먼저 묻고, 아니면 단방향으로 가자.",
    problem: "특별한 이유 없이 모든 엔티티에 양방향 연관관계를 매핑하고 있었어요.",
    reason:
      "양방향은 관리 포인트가 두 배가 되거든요. 연관관계 편의 메서드, 무한 루프, 직렬화 문제까지 따라와서 복잡도가 확 올라가요.",
    solution:
      "정말 양쪽에서 탐색이 필요한 경우가 아니면 단방향으로 두고, 필요할 때 조회 쿼리로 푸는 게 좋아요.",
    rules: [
      [
        "엔티티에 양방향 연관관계를 매핑하려고 할 때",
        "양방향 탐색이 실제로 필요한지 먼저 확인하고 아니면 단방향으로 두는 게 좋아요."
      ]
    ],
    pr: 312
  },
  {
    id: "c7",
    mission: "m2",
    cat: "아키텍처",
    tags: ["트랜잭션", "경계"],
    requester: "redibab",
    reviewers: ["kang", "neo"],
    conv: 3,
    title: "트랜잭션 경계는 Service에",
    summary: "트랜잭션은 비즈니스 단위로, Service 레이어에서 열고 닫자.",
    problem:
      "@Transactional이 Repository나 Controller에 붙어 있어서 트랜잭션 경계가 모호했어요.",
    reason:
      "트랜잭션은 하나의 비즈니스 작업 단위와 일치해야 하거든요. 경계가 흩어지면 어디서 커밋·롤백되는지 추적하기 어려워져요.",
    solution:
      "유스케이스 하나를 담당하는 Service 메서드에 트랜잭션을 걸어서, 경계를 비즈니스 단위와 맞춰주세요.",
    rules: [
      [
        "@Transactional을 Repository나 Controller에 붙이고 있을 때",
        "트랜잭션 경계를 Service 레이어의 유스케이스 단위로 옮기는 게 좋아요."
      ]
    ],
    pr: 288
  },
  {
    id: "c8",
    mission: "m2",
    cat: "테스트",
    tags: ["테스트 격리", "픽스처"],
    requester: "sun",
    reviewers: ["neo"],
    conv: 1,
    title: "테스트는 서로 격리되어야 해요",
    summary: "테스트끼리 상태를 공유하지 말고, 각자 독립적으로 서게 하자.",
    problem:
      "테스트들이 공유 데이터에 의존해서, 실행 순서가 바뀌면 깨지고 있었어요.",
    reason:
      "테스트가 서로의 상태에 의존하면 격리성이 깨지거든요. 하나만 고쳐도 엉뚱한 테스트가 같이 실패해서 신뢰할 수 없게 돼요.",
    solution:
      "각 테스트가 자기 데이터를 직접 준비하고 끝나면 정리하도록, 픽스처를 테스트 단위로 독립시켜보세요.",
    rules: [
      [
        "여러 테스트가 공유 상태나 실행 순서에 의존하고 있을 때",
        "각 테스트가 자기 데이터를 직접 준비하도록 격리하는 게 좋아요."
      ]
    ],
    pr: 201
  },
  {
    id: "c9",
    mission: "m3",
    cat: "아키텍처",
    tags: ["동시성", "락 전략"],
    requester: "lemon",
    reviewers: ["kang"],
    conv: 4,
    title: "재고 차감의 동시성 제어",
    summary: "경쟁 상태가 있는 자원은 락이든 원자 연산이든 보호막을 씌우자.",
    problem:
      "여러 요청이 동시에 같은 쿠폰 재고를 차감하면서 초과 발급이 발생하고 있었어요.",
    reason:
      "읽고-쓰는 사이에 다른 트랜잭션이 끼어들 수 있거든요(race condition). 검증과 차감이 원자적이지 않으면 재고가 음수까지 내려가요.",
    solution:
      "비관적 락이나 원자적 UPDATE 쿼리로 차감 구간을 보호해서, 한 번에 하나의 요청만 재고를 만지도록 만들어보세요.",
    rules: [
      [
        "여러 요청이 동시에 같은 자원의 수량을 변경할 수 있을 때",
        "락이나 원자적 연산으로 경쟁 구간을 보호하는 게 좋아요."
      ]
    ],
    pr: 188
  },
  {
    id: "c10",
    mission: "m3",
    cat: "네이밍",
    tags: ["네이밍", "불리언"],
    requester: "lemon",
    reviewers: ["neo"],
    conv: 1,
    title: "불리언 메서드는 질문처럼",
    summary: "true/false를 돌려주는 메서드는 is/has/can으로 질문하듯 이름 짓자.",
    problem:
      "불리언을 반환하는 메서드 이름이 checkStock처럼 동작인지 질문인지 모호했어요.",
    reason:
      "이름만 보고 반환 타입을 예측할 수 없으면 호출부 가독성이 떨어지거든요. check는 검사 후 뭔가 한다는 뉘앙스라 헷갈려요.",
    solution:
      "불리언을 돌려주는 메서드는 isAvailable, hasStock처럼 질문 형태로 이름을 지어주세요.",
    rules: [
      [
        "불리언을 반환하는 메서드 이름이 동작인지 질문인지 모호할 때",
        "is/has/can 같은 접두사로 질문 형태로 짓는 게 좋아요."
      ]
    ],
    pr: 240
  }
];

export const REQUESTERS: Record<string, [string, number, string][]> = {
  m1: [
    ["jinkshower", 42, "#c2410c"],
    ["pobi", 38, "#0f766e"],
    ["curl", 31, "#1d4ed8"],
    ["dompoo", 28, "#6d28d9"],
    ["hyunta", 24, "#b45309"],
    ["neo", 19, "#15803d"],
    ["brown", 16, "#be185d"],
    ["kong", 12, "#0e7490"]
  ],
  m2: [
    ["redibab", 38, "#c2410c"],
    ["sun", 27, "#0f766e"],
    ["kang", 18, "#1d4ed8"],
    ["neo", 22, "#6d28d9"]
  ],
  m3: [
    ["lemon", 33, "#c2410c"],
    ["neo", 19, "#0f766e"],
    ["kang", 18, "#1d4ed8"]
  ]
};

export const PROGRESS: Record<string, [string, number, number, number][]> = {
  all: [
    ["jinkshower", 18, 0.62, 42],
    ["redibab", 16, 0.55, 38],
    ["pobi", 15, 0.51, 38],
    ["lemon", 14, 0.48, 33],
    ["curl", 13, 0.44, 31],
    ["sun", 11, 0.39, 27],
    ["dompoo", 10, 0.36, 28],
    ["neo", 9, 0.31, 19]
  ],
  m1: [
    ["jinkshower", 14, 0.58, 42],
    ["pobi", 12, 0.49, 38],
    ["curl", 11, 0.45, 31],
    ["dompoo", 9, 0.38, 28],
    ["neo", 7, 0.3, 19]
  ],
  m2: [
    ["redibab", 13, 0.54, 38],
    ["sun", 11, 0.42, 27],
    ["neo", 9, 0.35, 22],
    ["kang", 8, 0.31, 18]
  ]
};

export const JOBS = [
  { mission: "roomescape-member", range: "400-455", status: "completed", result: "56/56 성공" },
  { mission: "shopping-order", range: "300-390", status: "running", result: "34/91 처리 중" },
  { mission: "coupon", range: "180-240", status: "partial_failed", result: "58/61 · 3 실패" },
  { mission: "roomescape-member", range: "200-280", status: "completed", result: "78/78 성공" },
  { mission: "shopping-order", range: "150-200", status: "pending", result: "대기 중" },
  { mission: "coupon", range: "100-150", status: "failed", result: "0/51 · API 오류" }
];
