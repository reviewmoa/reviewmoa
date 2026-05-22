import { parseIntegerParam } from "@/lib/api/query";
import { ok, serverError } from "@/lib/api/response";
import { getTagRankings } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    return ok(
      await getTagRankings({
        mission: searchParams.get("mission") ?? undefined,
        limit: parseIntegerParam(searchParams, "limit", 20)
      })
    );
  } catch (error) {
    return serverError(error);
  }
}
