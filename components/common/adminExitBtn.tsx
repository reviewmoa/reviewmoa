"use client";

import { useRouter } from "next/navigation";
import { ExitIcon } from "@/public/icons";

export function AdminExitBtn() {
  const router = useRouter();

  return (
    <button className="admin-nav-item admin-exit" type="button" onClick={() => router.push("/")}>
      <ExitIcon />
      공개 페이지로
    </button>
  );
}
