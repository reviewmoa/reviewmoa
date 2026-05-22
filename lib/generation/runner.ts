import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getGenerationSecrets } from "./env";

type JobRow = {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "partial_failed";
};

type JobItemRow = {
  id: string;
  pr_number: number;
};

type ItemResult = {
  status: "completed" | "failed";
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
    .select("id, status")
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

  let successPrCount = 0;
  let failedPrCount = 0;
  let resultCardCount = 0;

  for (const item of items ?? []) {
    await markItemRunning(item.id);

    const result = await runGenerationJobItem(item.pr_number);

    if (result.status === "completed") {
      successPrCount += 1;
    } else {
      failedPrCount += 1;
    }

    resultCardCount += result.cardCount;

    await finishItem(item.id, result);
  }

  const finalStatus =
    failedPrCount === 0 ? "completed" : successPrCount === 0 ? "failed" : "partial_failed";

  const { error: finishJobError } = await supabase
    .from("generation_jobs")
    .update({
      status: finalStatus,
      success_pr_count: successPrCount,
      failed_pr_count: failedPrCount,
      result_card_count: resultCardCount,
      error_summary: failedPrCount > 0 ? `${failedPrCount} PRs failed` : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId);

  if (finishJobError) {
    throw finishJobError;
  }

  return {
    jobId,
    status: finalStatus,
    totalPrCount: (items ?? []).length,
    successPrCount,
    failedPrCount,
    resultCardCount
  };
}

async function runGenerationJobItem(prNumber: number): Promise<ItemResult> {
  const { githubToken, aiApiKey } = getGenerationSecrets();

  if (!githubToken) {
    return {
      status: "failed",
      cardCount: 0,
      errorMessage: "GITHUB_TOKEN is required"
    };
  }

  if (!aiApiKey) {
    return {
      status: "failed",
      cardCount: 0,
      errorMessage: "AI_API_KEY or OPENAI_API_KEY is required"
    };
  }

  return {
    status: "failed",
    cardCount: 0,
    errorMessage: `Generation processor for PR #${prNumber} is not implemented yet`
  };
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
      card_count: result.cardCount,
      error_message: result.errorMessage,
      updated_at: new Date().toISOString()
    })
    .eq("id", itemId);

  if (error) {
    throw error;
  }
}
