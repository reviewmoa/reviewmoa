import type React from "react";

export function FilterGroup({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="filter-group-title">{title}</div>
      <div className="chip-col">{children}</div>
    </div>
  );
}
