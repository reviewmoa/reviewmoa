import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { getGenerationJob } from "@/lib/admin/generationJobs";
import { notFound, ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await requireAdmin();

    const { jobId } = await params;
    const job = await getGenerationJob(jobId);

    if (!job) {
      return notFound("Generation job not found");
    }

    return ok(job);
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
