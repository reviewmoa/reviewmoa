"use client";

import { useRouter } from "next/navigation";
import type { CategoryName, RuleCard, ViewName } from "../types";
import {
  pathForCard,
  pathForCategory,
  pathForMission,
  pathForRequester,
  pathForView
} from "../utils";

export function useRouteActions() {
  const router = useRouter();

  return {
    go: (view: ViewName) => router.push(pathForView(view)),
    openMission: (missionId: string) => router.push(pathForMission(missionId)),
    openRequesterCards: (missionId: string, requester: string) =>
      router.push(pathForRequester(missionId, requester)),
    openCategoryCards: (category: CategoryName) => router.push(pathForCategory(category)),
    openCard: (card: RuleCard) => router.push(pathForCard(card.id))
  };
}
