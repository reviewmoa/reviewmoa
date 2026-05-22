"use client";

import { useState } from "react";
import type { CategoryName, ListState } from "../types";
import { categoryFromSlug } from "../utils";
import { CardsView } from "../views/cardsView";
import { useRouteActions } from "./routeActions";

export function CategoryCardsPage({ categorySlug }: { categorySlug: string }) {
  const { go, openMission, openCard } = useRouteActions();
  const category = categoryFromSlug(categorySlug);
  const [listState, setListState] = useState<ListState>({
    mode: "category",
    cat: category,
    activeCats: [category],
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
