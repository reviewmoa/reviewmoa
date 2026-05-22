"use client";

import { useState } from "react";
import { missions } from "../data";
import type { CategoryName, ListState } from "../types";
import { CardsView } from "../views/cardsView";
import { useRouteActions } from "./routeActions";

export function RequesterCardsPage({
  missionId,
  requester
}: {
  missionId: string;
  requester: string;
}) {
  const { go, openMission, openCard } = useRouteActions();
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];
  const [listState, setListState] = useState<ListState>({
    mode: "requester",
    mission,
    requester,
    activeCats: [],
    activeTags: []
  });

  const toggleCat = (cat: CategoryName) => {
    setListState((current) => ({
      ...current,
      activeCats: current.activeCats.includes(cat)
        ? current.activeCats.filter((item) => item !== cat)
        : [...current.activeCats, cat]
    }));
  };

  const toggleTag = (tag: string) => {
    setListState((current) => ({
      ...current,
      activeTags: current.activeTags.includes(tag)
        ? current.activeTags.filter((item) => item !== tag)
        : [...current.activeTags, tag]
    }));
  };

  return (
    <CardsView
      go={go}
      listState={listState}
      openMission={openMission}
      openCard={openCard}
      toggleCat={toggleCat}
      toggleTag={toggleTag}
    />
  );
}
