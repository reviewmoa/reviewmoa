import { ok, serverError } from "@/lib/api/response";
import { getCategories } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getCategories());
  } catch (error) {
    return serverError(error);
  }
}
