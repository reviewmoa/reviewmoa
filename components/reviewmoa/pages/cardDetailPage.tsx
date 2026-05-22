"use client";

import { cards } from "../data";
import { DetailView } from "../views/detailView";
import { useRouteActions } from "./routeActions";

export function CardDetailPage({ cardId }: { cardId: string }) {
  const { go, openMission, openCard } = useRouteActions();
  const card = cards.find((item) => item.id === cardId) ?? cards[0];

  return <DetailView go={go} card={card} openMission={openMission} openCard={openCard} />;
}
