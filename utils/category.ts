import type { CategoryName } from "@/types/card";

export const COLOR_VARS: Record<string, [string, string]> = {
  teal: ["var(--teal)", "var(--teal-soft)"],
  purple: ["var(--purple)", "var(--purple-soft)"],
  blue: ["var(--blue)", "var(--blue-soft)"],
  amber: ["var(--amber)", "var(--amber-soft)"],
  green: ["var(--green)", "var(--green-soft)"],
  accent: ["var(--accent)", "var(--accent-soft)"],
  red: ["var(--red)", "var(--red-soft)"]
};

const COLOR_KEYS = Object.keys(COLOR_VARS);

export const colorOf = (cat: CategoryName) => {
  const sum = [...cat].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return COLOR_KEYS[sum % COLOR_KEYS.length];
};

export const accentOf = (cat: CategoryName) => COLOR_VARS[colorOf(cat)]?.[0] ?? COLOR_VARS.teal[0];

export const categoryStyle = (cat: CategoryName) => {
  const [color, background] = COLOR_VARS[colorOf(cat)] ?? COLOR_VARS.teal;
  return { color, background };
};

export const pathForCategory = (category: CategoryName) => `/categories/${category}`;

export const categoryFromSlug = (slug: string) => decodeURIComponent(slug);
