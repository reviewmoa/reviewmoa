import type { CategoryName } from "@/types/card";
import { CATS, CATEGORY_SLUGS, COLOR_VARS } from "@/components/data";

export function colorOf(cat: CategoryName) {
  return CATS[cat].color;
}

export function accentOf(cat: CategoryName) {
  return COLOR_VARS[colorOf(cat)][0];
}

export function categoryStyle(cat: CategoryName) {
  const [color, background] = COLOR_VARS[colorOf(cat)];
  return { color, background };
}

export function pathForCategory(category: CategoryName) {
  return `/categories/${CATEGORY_SLUGS[category]}`;
}

export function categoryFromSlug(slug: string) {
  return (Object.entries(CATEGORY_SLUGS).find(([, value]) => value === slug)?.[0] ??
    "레이어 분리") as CategoryName;
}
