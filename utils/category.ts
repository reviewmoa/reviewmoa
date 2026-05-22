import type { CategoryName } from "@/types/card";
import { CATS, CATEGORY_SLUGS, COLOR_VARS } from "@/components/data";

export const colorOf = (cat: CategoryName) => CATS[cat].color;

export const accentOf = (cat: CategoryName) => COLOR_VARS[colorOf(cat)][0];

export const categoryStyle = (cat: CategoryName) => {
  const [color, background] = COLOR_VARS[colorOf(cat)];
  return { color, background };
};

export const pathForCategory = (category: CategoryName) =>
  `/categories/${CATEGORY_SLUGS[category]}`;

export const categoryFromSlug = (slug: string) =>
  (Object.entries(CATEGORY_SLUGS).find(([, value]) => value === slug)?.[0] ??
    "레이어 분리") as CategoryName;
