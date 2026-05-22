"use client";

import { useRouter } from "next/navigation";
import { AdminView } from "../views/adminView";

type AdminPane = "missions" | "generate" | "jobs";

export function AdminPage({ pane }: { pane: AdminPane }) {
  const router = useRouter();

  return (
    <AdminView
      go={(view) => router.push(view === "home" ? "/" : `/${view}`)}
      pane={pane}
      setPane={(nextPane) => router.push(nextPane === "missions" ? "/admin" : `/admin/${nextPane}`)}
      showToast={(message) => window.alert(message)}
    />
  );
}
