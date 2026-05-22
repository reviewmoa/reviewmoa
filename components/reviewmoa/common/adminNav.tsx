import type React from "react";
import { cx } from "../utils";

export function AdminNav({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={cx("admin-nav-item", active && "on")} type="button" onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}
