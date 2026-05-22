"use client";

import { CategoriesView } from "../views/categoriesView";
import { useRouteActions } from "./routeActions";

export function CategoriesPage() {
  const { go, openCategoryCards } = useRouteActions();

  return <CategoriesView go={go} openCategoryCards={openCategoryCards} />;
}
