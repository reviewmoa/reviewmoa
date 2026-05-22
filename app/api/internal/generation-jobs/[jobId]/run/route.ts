import { fail, notFound, ok, serverError, unauthorized } from "@/lib/api/response";
import { getInternalJobSecret } from "@/lib/generation/env";
import { runGenerationJob } from "@/lib/generation/runner";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authorization = request.headers.get("authorization");
    const expected = `Bearer ${getInternalJobSecret()}`;

    if (authorization !== expected) {
      return unauthorized("Invalid internal job secret");
    }

    const { jobId } = await params;
    const result = await runGenerationJob(jobId);

    if (!result) {
      return notFound("Generation job not found");
    }

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("cannot run from status")) {
      return fail("invalid_job_status", error.message, 409);
    }

    return serverError(error);
  }
}
