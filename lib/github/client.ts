import "server-only";

type GithubRequestOptions = {
  token: string;
  method?: "GET" | "POST";
  body?: unknown;
};

const GITHUB_REST_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_API_VERSION = "2022-11-28";

export class GithubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function githubRest<T>(path: string, options: GithubRequestOptions) {
  const response = await fetch(`${GITHUB_REST_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${options.token}`,
      "User-Agent": "reviewmoa-generation-worker",
      "X-GitHub-Api-Version": GITHUB_API_VERSION
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    throw new GithubApiError(await response.text(), response.status);
  }

  return {
    data: (await response.json()) as T,
    headers: response.headers
  };
}

export async function githubRestPaginated<T>(path: string, token: string) {
  const rows: T[] = [];

  for (let page = 1; ; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const { data } = await githubRest<T[]>(`${path}${separator}per_page=100&page=${page}`, {
      token
    });

    rows.push(...data);

    if (data.length < 100) {
      break;
    }
  }

  return rows;
}

export async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string
) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "reviewmoa-generation-worker",
      "X-GitHub-Api-Version": GITHUB_API_VERSION
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new GithubApiError(await response.text(), response.status);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new GithubApiError(payload.errors.map((error) => error.message).join("; "), 200);
  }

  if (!payload.data) {
    throw new GithubApiError("GitHub GraphQL returned no data", 200);
  }

  return payload.data;
}
