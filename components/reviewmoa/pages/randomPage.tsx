"use client";

import { useState } from "react";
import { cards } from "../data";
import { RandomView } from "../views/randomView";
import { useRouteActions } from "./routeActions";

export function RandomPage() {
  const { go, openCard } = useRouteActions();
  const [randomMission, setRandomMission] = useState("all");
  const [randomCard, setRandomCard] = useState(cards[0]);

  const drawRandom = (missionId = randomMission) => {
    const pool = missionId === "all" ? cards : cards.filter((card) => card.mission === missionId);
    const source = pool.length ? pool : cards;
    setRandomCard(source[Math.floor(Math.random() * source.length)]);
  };

  return (
    <RandomView
      go={go}
      randomMission={randomMission}
      setRandomMission={setRandomMission}
      randomCard={randomCard}
      drawRandom={drawRandom}
      openCard={openCard}
    />
  );
}
