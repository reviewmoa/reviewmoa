export type ViewName =
  | "home"
  | "missions"
  | "requesters"
  | "cards"
  | "detail"
  | "categories"
  | "tagrank"
  | "progress"
  | "random"
  | "admin";

export type CategoryName =
  | "레이어 분리"
  | "객체지향"
  | "네이밍"
  | "예외처리"
  | "테스트"
  | "아키텍처";

export type Mission = {
  id: string;
  level: number;
  name: string;
  repo: string;
  cards: number;
  requesters: number;
  prRange: string;
  tags: string[];
};

export type RuleCard = {
  id: string;
  mission: string;
  cat: CategoryName;
  tags: string[];
  requester: string;
  reviewers: string[];
  conv: number;
  title: string;
  summary: string;
  problem: string;
  reason: string;
  solution: string;
  badCode?: string;
  goodCode?: string;
  rules: [string, string][];
  pr: number;
};

export type ListState =
  | {
      mode: "requester";
      mission: Mission;
      requester: string;
      activeCats: CategoryName[];
      activeTags: string[];
    }
  | {
      mode: "category";
      cat: CategoryName;
      activeCats: CategoryName[];
      activeTags: string[];
    };
