import { MissionRequestersPage } from "@/components/reviewmoa/pages/missionRequestersPage";

export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;

  return <MissionRequestersPage missionId={missionId} />;
}
