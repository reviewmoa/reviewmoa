export type CategoryName =
  | "레이어 분리"
  | "객체지향"
  | "네이밍"
  | "예외처리"
  | "테스트"
  | "아키텍처";

export interface RuleCard {
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
}
