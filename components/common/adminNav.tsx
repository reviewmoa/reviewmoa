"use client";

import type React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@/utils";

interface AdminNavProps {
  path: string;
  icon: React.ReactNode;
  label: string;
}

export function AdminNav({ path, icon, label }: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      className={cx("admin-nav-item", pathname === path && "on")}
      type="button"
      onClick={() => router.push(path)}
    >
      {icon}
      {label}
    </button>
  );
}
