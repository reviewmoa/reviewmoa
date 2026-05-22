"use client";

import type React from "react";
import { AdminExitBtn, AdminNav } from "@/components/common";
import { BoxIcon, MenuIcon, SparkIcon } from "@/public/icons";

const NAV_ITEMS = [
  { path: "/admin", icon: <MenuIcon />, label: "미션 관리" },
  { path: "/admin/generate", icon: <SparkIcon />, label: "규칙카드 생성" },
  { path: "/admin/jobs", icon: <BoxIcon />, label: "작업 관리" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="view active">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side-brand">관리자 콘솔</div>
          {NAV_ITEMS.map((item) => (
            <AdminNav key={item.path} {...item} />
          ))}
          <AdminExitBtn />
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
