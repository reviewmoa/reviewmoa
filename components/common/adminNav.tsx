import type React from "react";
import { cx } from "@/utils";

interface AdminNavProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function AdminNav({ active, icon, label, onClick }: AdminNavProps) {
  return (
    <button className={cx("admin-nav-item", active && "on")} type="button" onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}
