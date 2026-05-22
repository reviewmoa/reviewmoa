import "server-only";

import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const jobStatuses = ["pending", "running", "completed", "failed", "partial_failed"] as const;

export const generationJobStatusSchema = z.enum(jobStatuses);

export const createGenerationJobSchema = z
  .object({
    missionId: z.string().uuid(),
    prStart: z.number().int().positive(),
    prEnd: z.number().int().positive(),
    excludedPrNumbers: z.array(z.number().int().positive()).default([])
  })
  .superRefine((value, ctx) => {
    if (value.prStart > value.prEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prEnd"],
        message: "prEnd must be greater than or equal to prStart"
      });
    }

    const uniqueExcluded = new Set(value.excludedPrNumbers);
    const totalCount = value.prEnd - value.prStart + 1 - uniqueExcluded.size;

    if (totalCount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prEnd"],
        message: "A generation job can include at most 100 PRs"
      });
    }

    value.excludedPrNumbers.forEach((prNumber) => {
      if (prNumber < value.prStart || prNumber > value.prEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["excludedPrNumbers"],
          message: "excludedPrNumbers must be within the PR range"
        });
      }
    });
  });

export const listGenerationJobsSchema = z.object({
  status: generationJobStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20)
});

export const retryGenerationJobSchema = z.object({
  prNumbers: z.array(z.number().int().positive()).optional()
});

type JobStatus = (typeof jobStatuses)[number];
type ItemStatus = "pending" | "running" | "completed" | "failed" | "skipped";

type MissionRef = {
  id: string;
  slug: string;
  name: string;
};

type JobRow = {
  id: string;
  mission_id: string;
  requested_by: string | null;
  pr_start: number;
  pr_end: number;
  excluded_pr_numbers: number[];
  status: JobStatus;
  total_pr_count: number;
  success_pr_count: number;
  failed_pr_count: number;
  result_card_count: number;
  error_summary: string | null;
  created_at: string;
  updated_at: string;
  missions: MissionRef | null;
};

type JobItemRow = {
  id: string;
  pr_number: number;
  status: ItemStatus;
  card_count: number;
  error_message: string | null;
};

export type GenerationJobListItem = {
  id: string;
  mission: MissionRef;
  requestedBy: string | null;
  prStart: number;
  prEnd: number;
  excludedPrNumbers: number[];
  status: JobStatus;
  totalPrCount: number;
  successPrCount: number;
  failedPrCount: number;
  resultCardCount: number;
  errorSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GenerationJobDetail = GenerationJobListItem & {
  items: Array<{
    id: string;
    prNumber: number;
    status: ItemStatus;
    cardCount: number;
    errorMessage: string | null;
  }>;
};

function mapJob(row: JobRow): GenerationJobListItem {
  return {
    id: row.id,
    mission: row.missions ?? {
      id: row.mission_id,
      slug: "",
      name: ""
    },
    requestedBy: row.requested_by,
    prStart: row.pr_start,
    prEnd: row.pr_end,
    excludedPrNumbers: row.excluded_pr_numbers ?? [],
    status: row.status,
    totalPrCount: row.total_pr_count,
    successPrCount: row.success_pr_count,
    failedPrCount: row.failed_pr_count,
    resultCardCount: row.result_card_count,
    errorSummary: row.error_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function makePrNumbers(prStart: number, prEnd: number, excludedPrNumbers: number[]) {
  const excluded = new Set(excludedPrNumbers);
  const prNumbers: number[] = [];

  for (let prNumber = prStart; prNumber <= prEnd; prNumber += 1) {
    if (!excluded.has(prNumber)) {
      prNumbers.push(prNumber);
    }
  }

  return prNumbers;
}

export async function createGenerationJob(
  input: z.infer<typeof createGenerationJobSchema>,
  requestedBy: string
) {
  const supabase = createSupabaseServiceClient();
  const prNumbers = makePrNumbers(input.prStart, input.prEnd, input.excludedPrNumbers);
  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq("id", input.missionId)
    .maybeSingle();

  if (missionError) {
    throw missionError;
  }

  if (!mission) {
    return null;
  }

  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .insert({
      mission_id: input.missionId,
      requested_by: requestedBy,
      pr_start: input.prStart,
      pr_end: input.prEnd,
      excluded_pr_numbers: [...new Set(input.excludedPrNumbers)].sort((a, b) => a - b),
      total_pr_count: prNumbers.length,
      status: "pending"
    })
    .select("id, mission_id, requested_by, pr_start, pr_end, excluded_pr_numbers, status, total_pr_count, success_pr_count, failed_pr_count, result_card_count, error_summary, created_at, updated_at, missions(id, slug, name)")
    .single<JobRow>();

  if (jobError) {
    throw jobError;
  }

  if (prNumbers.length > 0) {
    const { error: itemError } = await supabase.from("generation_job_items").insert(
      prNumbers.map((prNumber) => ({
        generation_job_id: job.id,
        pr_number: prNumber,
        status: "pending"
      }))
    );

    if (itemError) {
      throw itemError;
    }
  }

  return mapJob(job);
}

export async function listGenerationJobs(input: z.infer<typeof listGenerationJobsSchema>) {
  const supabase = createSupabaseServiceClient();
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("generation_jobs")
    .select(
      "id, mission_id, requested_by, pr_start, pr_end, excluded_pr_numbers, status, total_pr_count, success_pr_count, failed_pr_count, result_card_count, error_summary, created_at, updated_at, missions(id, slug, name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (input.status) {
    query = query.eq("status", input.status);
  }

  const { data, error, count } = await query.range(from, to).returns<JobRow[]>();

  if (error) {
    throw error;
  }

  return {
    items: (data ?? []).map(mapJob),
    total: count ?? 0,
    page: input.page,
    limit: input.limit
  };
}

export async function getGenerationJob(jobId: string): Promise<GenerationJobDetail | null> {
  const supabase = createSupabaseServiceClient();
  const [{ data: job, error: jobError }, { data: items, error: itemsError }] = await Promise.all([
    supabase
      .from("generation_jobs")
      .select("id, mission_id, requested_by, pr_start, pr_end, excluded_pr_numbers, status, total_pr_count, success_pr_count, failed_pr_count, result_card_count, error_summary, created_at, updated_at, missions(id, slug, name)")
      .eq("id", jobId)
      .maybeSingle<JobRow>(),
    supabase
      .from("generation_job_items")
      .select("id, pr_number, status, card_count, error_message")
      .eq("generation_job_id", jobId)
      .order("pr_number", { ascending: true })
      .returns<JobItemRow[]>()
  ]);

  if (jobError) {
    throw jobError;
  }

  if (itemsError) {
    throw itemsError;
  }

  if (!job) {
    return null;
  }

  return {
    ...mapJob(job),
    items: (items ?? []).map((item) => ({
      id: item.id,
      prNumber: item.pr_number,
      status: item.status,
      cardCount: item.card_count,
      errorMessage: item.error_message
    }))
  };
}

export async function retryGenerationJob(
  jobId: string,
  input: z.infer<typeof retryGenerationJobSchema>
) {
  const supabase = createSupabaseServiceClient();
  let failedItemsQuery = supabase
    .from("generation_job_items")
    .select("id, pr_number")
    .eq("generation_job_id", jobId)
    .eq("status", "failed");

  if (input.prNumbers?.length) {
    failedItemsQuery = failedItemsQuery.in("pr_number", input.prNumbers);
  }

  const { data: failedItems, error: failedItemsError } = await failedItemsQuery.returns<
    Array<{ id: string; pr_number: number }>
  >();

  if (failedItemsError) {
    throw failedItemsError;
  }

  if (!failedItems || failedItems.length === 0) {
    return {
      jobId,
      retriedPrNumbers: [] as number[],
      status: "pending" as const
    };
  }

  const itemIds = failedItems.map((item) => item.id);
  const { error: updateItemsError } = await supabase
    .from("generation_job_items")
    .update({
      status: "pending",
      card_count: 0,
      error_message: null,
      updated_at: new Date().toISOString()
    })
    .in("id", itemIds);

  if (updateItemsError) {
    throw updateItemsError;
  }

  const { error: updateJobError } = await supabase
    .from("generation_jobs")
    .update({
      status: "pending",
      error_summary: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId);

  if (updateJobError) {
    throw updateJobError;
  }

  return {
    jobId,
    retriedPrNumbers: failedItems.map((item) => item.pr_number).sort((a, b) => a - b),
    status: "pending" as const
  };
}
