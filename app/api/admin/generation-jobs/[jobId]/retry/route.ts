import { ZodError } from "zod";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { retryGenerationJob, retryGenerationJobSchema } from "@/lib/admin/generationJobs";
import { ok } from "@/lib/api/response";
import { validationErrorResponse } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await requireAdmin();

    const { jobId } = await params;
    const input = retryGenerationJobSchema.parse(await request.json().catch(() => ({})));

    return ok(await retryGenerationJob(jobId, input));
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return adminAuthErrorResponse(error);
  }
}
