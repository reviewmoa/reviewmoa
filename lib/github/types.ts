export type GithubPullRequest = {
  number: number;
  url: string;
  htmlUrl: string;
  title: string | null;
  state: string | null;
  mergedAt: string | null;
  requester: string;
};

export type GithubReviewSourceType = "review_comment" | "review_body" | "issue_comment";

export type GithubReviewSource = {
  sourceType: GithubReviewSourceType;
  githubCommentId: string;
  githubUrl: string | null;
  reviewer: string | null;
  path: string | null;
  diffHunk: string | null;
  body: string;
  isResolved: boolean | null;
  isOutdated: boolean | null;
  isMinimized: boolean | null;
  minimizedReason: string | null;
};

export type GithubPullRequestReviewData = {
  owner: string;
  repo: string;
  pullRequest: GithubPullRequest;
  sources: GithubReviewSource[];
};
