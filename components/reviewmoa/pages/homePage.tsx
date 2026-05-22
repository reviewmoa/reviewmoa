"use client";

import { HomeView } from "../views/homeView";
import { useRouteActions } from "./routeActions";

export function HomePage() {
  const { go, openMission, openCategoryCards } = useRouteActions();

  return <HomeView go={go} openMission={openMission} openCategoryCards={openCategoryCards} />;
}
