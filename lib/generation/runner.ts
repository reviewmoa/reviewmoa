import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getGenerationSecrets } from "./env";
import { processGenerationJobItem } from "./processor";

type JobRow = {
  id: string;
  mission_id: string;
  status: "pending" | "running" | "completed" | "failed" | "partial_failed";
};

type JobItemRow = {
  id: string;
  pr_number: number;
};

type ItemResult = {
  status: "completed" | "failed";
  pullRequestId: string | null;
  cardCount: number;
  errorMessage: string | null;
};

export type RunGenerationJobResult = {
  jobId: string;
  status: "completed" | "failed" | "partial_failed";
  totalPrCount: number;
  successPrCount: number;
  failedPrCount: number;
  resultCardCount: number;
};

export async function runGenerationJob(jobId: string): Promise<RunGenerationJobResult | null> {
  const supabase = createSupabaseServiceClient();
  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .select("id, mission_id, status")
    .eq("id", jobId)
    .maybeSingle<JobRow>();

  if (jobError) {
    throw jobError;
  }

  if (!job) {
    return null;
  }

  if (job.status !== "pending" && job.status !== "running") {
    throw new Error(`Generation job cannot run from status ${job.status}`);
  }

  await markJobRunning(jobId);

  const { data: items, error: itemsError } = await supabase
    .from("generation_job_items")
    .select("id, pr_number")
    .eq("generation_job_id", jobId)
    .in("status", ["pending", "failed"])
    .order("pr_number", { ascending: true })
    .returns<JobItemRow[]>();

  if (itemsError) {
    throw itemsError;
  }

  for (const item of items ?? []) {
    await markItemRunning(item.id);

    const result = await runGenerationJobItem(job.mission_id, item.pr_number);

    await finishItem(item.id, result);
  }

  const summary = await summarizeJobItems(jobId);
  const finalStatus =
    summary.failedPrCount === 0
      ? "completed"
      : summary.successPrCount === 0
        ? "failed"
        : "partial_failed";

  const { error: finishJobError } = await supabase
    .from("generation_jobs")
    .update({
      status: finalStatus,
      success_pr_count: summary.successPrCount,
      failed_pr_count: summary.failedPrCount,
      result_card_count: summary.resultCardCount,
      error_summary: summary.failedPrCount > 0 ? `${summary.failedPrCount} PRs failed` : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId);

  if (finishJobError) {
    throw finishJobError;
  }

  return {
    jobId,
    status: finalStatus,
    totalPrCount: summary.totalPrCount,
    successPrCount: summary.successPrCount,
    failedPrCount: summary.failedPrCount,
    resultCardCount: summary.resultCardCount
  };
}

async function runGenerationJobItem(missionId: string, prNumber: number): Promise<ItemResult> {
  const { githubToken, aiApiKey, aiModel, aiBaseUrl } = getGenerationSecrets();

  if (!githubToken) {
    return {
      status: "failed",
      pullRequestId: null,
      cardCount: 0,
      errorMessage: "GITHUB_TOKEN is required"
    };
  }

  if (!aiApiKey) {
    return {
      status: "failed",
      pullRequestId: null,
      cardCount: 0,
      errorMessage: "AI_API_KEY or OPENAI_API_KEY is required"
    };
  }

  try {
    const result = await processGenerationJobItem({
      missionId,
      prNumber,
      githubToken,
      aiApiKey,
      aiModel,
      aiBaseUrl
    });

    return {
      status: "completed",
      pullRequestId: result.pullRequestId,
      cardCount: result.cardCount,
      errorMessage: null
    };
  } catch (error) {
    return {
      status: "failed",
      pullRequestId: null,
      cardCount: 0,
      errorMessage: error instanceof Error ? error.message : `Generation failed for PR #${prNumber}`
    };
  }
}

async function markJobRunning(jobId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("generation_jobs")
    .update({
      status: "running",
      error_summary: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId);

  if (error) {
    throw error;
  }
}

async function markItemRunning(itemId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("generation_job_items")
    .update({
      status: "running",
      error_message: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", itemId);

  if (error) {
    throw error;
  }
}

async function finishItem(itemId: string, result: ItemResult) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("generation_job_items")
    .update({
      status: result.status,
      pull_request_id: result.pullRequestId,
      card_count: result.cardCount,
      error_message: result.errorMessage,
      updated_at: new Date().toISOString()
    })
    .eq("id", itemId);

  if (error) {
    throw error;
  }
}

async function summarizeJobItems(jobId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("generation_job_items")
    .select("status, card_count")
    .eq("generation_job_id", jobId)
    .returns<Array<{ status: string; card_count: number }>>();

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (summary, item) => ({
      totalPrCount: summary.totalPrCount + 1,
      successPrCount: summary.successPrCount + (item.status === "completed" ? 1 : 0),
      failedPrCount: summary.failedPrCount + (item.status === "failed" ? 1 : 0),
      resultCardCount: summary.resultCardCount + item.card_count
    }),
    {
      totalPrCount: 0,
      successPrCount: 0,
      failedPrCount: 0,
      resultCardCount: 0
    }
  );
}
