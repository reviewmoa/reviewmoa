import { ok, serverError } from "@/lib/api/response";
import { getMissions } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active") !== "false";

    return ok(await getMissions(active));
  } catch (error) {
    return serverError(error);
  }
}
