import { serverError, ok } from "@/lib/api/response";
import { getHomeSummary } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getHomeSummary());
  } catch (error) {
    return serverError(error);
  }
}
