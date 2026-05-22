import type { CategoryName, RuleCard } from "./types";
import { categorySlugs, cats, colorVars } from "./data";

export function colorOf(cat: CategoryName) {
  return cats[cat].color;
}

export function accentOf(cat: CategoryName) {
  return colorVars[colorOf(cat)][0];
}

export function categoryStyle(cat: CategoryName) {
  const [color, background] = colorVars[colorOf(cat)];
  return { color, background };
}

export function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function countTags(items: RuleCard[]) {
  return items.reduce<Record<string, number>>((acc, card) => {
    card.tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});
}

export function pathForView(view: string) {
  const paths: Record<string, string> = {
    home: "/",
    missions: "/missions",
    categories: "/categories",
    tagrank: "/tagrank",
    progress: "/progress",
    random: "/random",
    admin: "/admin"
  };

  return paths[view] ?? "/";
}

export function pathForMission(missionId: string) {
  return `/missions/${missionId}`;
}

export function pathForRequester(missionId: string, requester: string) {
  return `/missions/${missionId}/requesters/${requester}`;
}

export function pathForCategory(category: CategoryName) {
  return `/categories/${categorySlugs[category]}`;
}

export function categoryFromSlug(slug: string) {
  return (Object.entries(categorySlugs).find(([, value]) => value === slug)?.[0] ??
    "레이어 분리") as CategoryName;
}

export function pathForCard(cardId: string) {
  return `/cards/${cardId}`;
}
