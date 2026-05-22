import { notFound, ok, serverError } from "@/lib/api/response";
import { getRandomCard } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const card = await getRandomCard({
      mission: searchParams.get("mission") ?? undefined,
      category: searchParams.get("category") ?? undefined
    });

    if (!card) {
      return notFound("Review card not found");
    }

    return ok(card);
  } catch (error) {
    return serverError(error);
  }
}
