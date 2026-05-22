import { notFound, ok, serverError } from "@/lib/api/response";
import { getCardById } from "@/lib/reviewmoa/publicQueries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const card = await getCardById(cardId);

    if (!card) {
      return notFound("Review card not found");
    }

    return ok(card);
  } catch (error) {
    return serverError(error);
  }
}
