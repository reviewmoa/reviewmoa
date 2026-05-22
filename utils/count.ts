import type { RuleCard } from "@/types/card";

export const countBy = <T>(items: T[], getKey: (item: T) => string): Record<string, number> =>
  items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

export const countTags = (items: RuleCard[]): Record<string, number> =>
  items.reduce<Record<string, number>>((acc, card) => {
    card.tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});
