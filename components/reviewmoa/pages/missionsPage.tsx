"use client";

import { MissionsView } from "../views/missionsView";
import { useRouteActions } from "./routeActions";

export function MissionsPage() {
  const { go, openMission } = useRouteActions();

  return <MissionsView go={go} openMission={openMission} />;
}
