export interface Mission {
  id: string;
  slug: string;
  level: number;
  name: string;
  owner: string;
  repo: string;
  cards: number;
  requesters: number;
  prRange: string;
  tags: string[];
}
