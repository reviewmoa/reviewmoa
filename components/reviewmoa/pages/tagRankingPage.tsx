"use client";

import { TagRankingView } from "../views/tagRankingView";
import { useRouteActions } from "./routeActions";

export function TagRankingPage() {
  const { go } = useRouteActions();

  return <TagRankingView go={go} />;
}
