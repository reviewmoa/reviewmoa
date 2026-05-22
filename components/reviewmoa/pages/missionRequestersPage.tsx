"use client";

import { missions } from "../data";
import { RequestersView } from "../views/requestersView";
import { useRouteActions } from "./routeActions";

export function MissionRequestersPage({ missionId }: { missionId: string }) {
  const { go, openRequesterCards } = useRouteActions();
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];

  return (
    <RequestersView
      go={go}
      mission={mission}
      openRequesterCards={(requester) => openRequesterCards(mission.id, requester)}
    />
  );
}
