import type { CategoryName } from "@/types/card";
import { cats, categorySlugs, colorVars } from "@/components/data";

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

export function pathForCategory(category: CategoryName) {
  return `/categories/${categorySlugs[category]}`;
}

export function categoryFromSlug(slug: string) {
  return (Object.entries(categorySlugs).find(([, value]) => value === slug)?.[0] ??
    "레이어 분리") as CategoryName;
}
