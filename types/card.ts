export type CategoryName = string;

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
