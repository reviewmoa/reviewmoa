export function parseIntegerParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: number
) {
  const value = searchParams.get(key);

  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseTagsParam(searchParams: URLSearchParams) {
  return (searchParams.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseSortParam(searchParams: URLSearchParams) {
  const sort = searchParams.get("sort");

  if (sort === "pr_number" || sort === "tag_count") {
    return sort;
  }

  return "latest";
}
