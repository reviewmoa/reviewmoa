import type React from "react";

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
}

export function FilterGroup({ title, children }: FilterGroupProps) {
  return (
    <div>
      <div className="filter-group-title">{title}</div>
      <div className="chip-col">{children}</div>
    </div>
  );
}
