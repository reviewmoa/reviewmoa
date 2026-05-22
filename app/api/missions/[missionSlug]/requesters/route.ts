import { ok, serverError } from "@/lib/api/response";
import { getMissionRequesters } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ missionSlug: string }> }
) {
  try {
    const { missionSlug } = await params;

    return ok(await getMissionRequesters(missionSlug));
  } catch (error) {
    return serverError(error);
  }
}
