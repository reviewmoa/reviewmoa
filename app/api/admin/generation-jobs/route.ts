import { ZodError } from "zod";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import {
  createGenerationJob,
  createGenerationJobSchema,
  generationJobStatusSchema,
  listGenerationJobs,
  listGenerationJobsSchema
} from "@/lib/admin/generationJobs";
import { parseIntegerParam } from "@/lib/api/query";
import { created, notFound, paginated } from "@/lib/api/response";
import { validationErrorResponse } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = listGenerationJobsSchema.parse({
      status: status ? generationJobStatusSchema.parse(status) : undefined,
      page: parseIntegerParam(searchParams, "page", 1),
      limit: parseIntegerParam(searchParams, "limit", 20)
    });
    const result = await listGenerationJobs(query);

    return paginated(result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return adminAuthErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const input = createGenerationJobSchema.parse(await request.json());
    const job = await createGenerationJob(input, admin.email);

    if (!job) {
      return notFound("Mission not found");
    }

    return created(job);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return adminAuthErrorResponse(error);
  }
}
