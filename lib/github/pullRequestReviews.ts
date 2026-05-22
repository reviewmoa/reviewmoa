import "server-only";

import {
  githubGraphql,
  githubRest,
  githubRestPaginated
} from "./client";
import type {
  GithubPullRequest,
  GithubPullRequestReviewData,
  GithubReviewSource
} from "./types";

type GithubUser = {
  login?: string;
};

type PullRequestResponse = {
  number: number;
  url: string;
  html_url: string;
  title: string | null;
  state: string | null;
  merged_at: string | null;
  user: GithubUser | null;
};

type IssueCommentResponse = {
  id: number;
  html_url: string;
  body: string | null;
  user: GithubUser | null;
};

type ReviewResponse = {
  id: number;
  html_url: string;
  body: string | null;
  state: string | null;
  user: GithubUser | null;
};

type ReviewCommentResponse = {
  id: number;
  node_id: string;
  html_url: string;
  body: string | null;
  user: GithubUser | null;
  path: string | null;
  diff_hunk: string | null;
  position: number | null;
  original_position: number | null;
};

type ReviewThreadMeta = {
  isResolved: boolean | null;
  isMinimized: boolean | null;
  minimizedReason: string | null;
};

type ReviewThreadsQuery = {
  repository: {
    pullRequest: {
      reviewThreads: {
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Array<{
          isResolved: boolean;
          comments: {
            nodes: Array<{
              databaseId: number | null;
              isMinimized: boolean;
              minimizedReason: string | null;
            } | null>;
          };
        } | null>;
      };
    } | null;
  } | null;
};

type ReviewThreads = NonNullable<
  NonNullable<ReviewThreadsQuery["repository"]>["pullRequest"]
>["reviewThreads"];

const REVIEW_THREADS_QUERY = `
  query ReviewThreads($owner: String!, $repo: String!, $number: Int!, $after: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        reviewThreads(first: 100, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            isResolved
            comments(first: 100) {
              nodes {
                databaseId
                isMinimized
                minimizedReason
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchPullRequestReviewData({
  owner,
  repo,
  prNumber,
  token
}: {
  owner: string;
  repo: string;
  prNumber: number;
  token: string;
}): Promise<GithubPullRequestReviewData> {
  const pullRequest = await fetchPullRequest(owner, repo, prNumber, token);
  const [issueComments, reviews, reviewComments, threadMeta] = await Promise.all([
    fetchIssueComments(owner, repo, prNumber, token),
    fetchReviews(owner, repo, prNumber, token),
    fetchReviewComments(owner, repo, prNumber, token),
    fetchReviewThreadMeta(owner, repo, prNumber, token)
  ]);

  return {
    owner,
    repo,
    pullRequest,
    sources: [
      ...reviews.map((review): GithubReviewSource | null => {
        if (!review.body?.trim()) {
          return null;
        }

        return {
          sourceType: "review_body",
          githubCommentId: `review:${review.id}`,
          githubUrl: review.html_url,
          reviewer: review.user?.login ?? null,
          path: null,
          diffHunk: null,
          body: review.body,
          isResolved: null,
          isOutdated: null,
          isMinimized: null,
          minimizedReason: null
        };
      }),
      ...reviewComments.map((comment): GithubReviewSource | null => {
        if (!comment.body?.trim()) {
          return null;
        }

        const meta = threadMeta.get(String(comment.id));

        return {
          sourceType: "review_comment",
          githubCommentId: String(comment.id),
          githubUrl: comment.html_url,
          reviewer: comment.user?.login ?? null,
          path: comment.path,
          diffHunk: comment.diff_hunk,
          body: comment.body,
          isResolved: meta?.isResolved ?? null,
          isOutdated: comment.position === null && comment.original_position !== null,
          isMinimized: meta?.isMinimized ?? null,
          minimizedReason: meta?.minimizedReason ?? null
        };
      }),
      ...issueComments.map((comment): GithubReviewSource | null => {
        if (!comment.body?.trim()) {
          return null;
        }

        return {
          sourceType: "issue_comment",
          githubCommentId: `issue:${comment.id}`,
          githubUrl: comment.html_url,
          reviewer: comment.user?.login ?? null,
          path: null,
          diffHunk: null,
          body: comment.body,
          isResolved: null,
          isOutdated: null,
          isMinimized: null,
          minimizedReason: null
        };
      })
    ].filter((source): source is GithubReviewSource => Boolean(source))
  };
}

async function fetchPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  token: string
): Promise<GithubPullRequest> {
  const { data } = await githubRest<PullRequestResponse>(
    `/repos/${owner}/${repo}/pulls/${prNumber}`,
    { token }
  );

  return {
    number: data.number,
    url: data.url,
    htmlUrl: data.html_url,
    title: data.title,
    state: data.state,
    mergedAt: data.merged_at,
    requester: data.user?.login ?? "unknown"
  };
}

async function fetchIssueComments(owner: string, repo: string, prNumber: number, token: string) {
  return githubRestPaginated<IssueCommentResponse>(
    `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    token
  );
}

async function fetchReviews(owner: string, repo: string, prNumber: number, token: string) {
  return githubRestPaginated<ReviewResponse>(
    `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    token
  );
}

async function fetchReviewComments(owner: string, repo: string, prNumber: number, token: string) {
  return githubRestPaginated<ReviewCommentResponse>(
    `/repos/${owner}/${repo}/pulls/${prNumber}/comments`,
    token
  );
}

async function fetchReviewThreadMeta(owner: string, repo: string, prNumber: number, token: string) {
  const meta = new Map<string, ReviewThreadMeta>();
  let after: string | null = null;

  try {
    for (;;) {
      const data: ReviewThreadsQuery = await githubGraphql<ReviewThreadsQuery>(
        REVIEW_THREADS_QUERY,
        {
          owner,
          repo,
          number: prNumber,
          after
        },
        token
      );
      const threads: ReviewThreads | undefined = data.repository?.pullRequest?.reviewThreads;

      if (!threads) {
        break;
      }

      threads.nodes.forEach((thread) => {
        thread?.comments.nodes.forEach((comment) => {
          if (!comment?.databaseId) {
            return;
          }

          meta.set(String(comment.databaseId), {
            isResolved: thread.isResolved,
            isMinimized: comment.isMinimized,
            minimizedReason: comment.minimizedReason
          });
        });
      });

      if (!threads.pageInfo.hasNextPage) {
        break;
      }

      after = threads.pageInfo.endCursor;
    }
  } catch {
    return meta;
  }

  return meta;
}
