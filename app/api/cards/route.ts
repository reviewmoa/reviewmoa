import { parseIntegerParam, parseSortParam, parseTagsParam } from "@/lib/api/query";
import { paginated, serverError } from "@/lib/api/response";
import { getCards } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getCards({
      mission: searchParams.get("mission") ?? undefined,
      requester: searchParams.get("requester") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tags: parseTagsParam(searchParams),
      q: searchParams.get("q") ?? undefined,
      page: parseIntegerParam(searchParams, "page", 1),
      limit: parseIntegerParam(searchParams, "limit", 20),
      sort: parseSortParam(searchParams)
    });

    return paginated(result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total
    });
  } catch (error) {
    return serverError(error);
  }
}
