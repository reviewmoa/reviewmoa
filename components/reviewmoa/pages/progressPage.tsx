"use client";

import { useState } from "react";
import { ProgressView } from "../views/progressView";
import { useRouteActions } from "./routeActions";

export function ProgressPage() {
  const { go } = useRouteActions();
  const [scope, setScope] = useState("all");

  return (
    <ProgressView
      go={go}
      scope={scope}
      setScope={setScope}
      showToast={(message) => window.alert(message)}
    />
  );
}
