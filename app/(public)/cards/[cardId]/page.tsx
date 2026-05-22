import { CardDetailPage } from "@/components/reviewmoa/pages/cardDetailPage";

export default async function Page({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;

  return <CardDetailPage cardId={cardId} />;
}
