import { RequesterCardsPage } from "@/components/reviewmoa/pages/requesterCardsPage";

export default async function Page({
  params
}: {
  params: Promise<{ missionId: string; requester: string }>;
}) {
  const { missionId, requester } = await params;

  return <RequesterCardsPage missionId={missionId} requester={decodeURIComponent(requester)} />;
}
