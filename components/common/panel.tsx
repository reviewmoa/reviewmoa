import type React from "react";

interface PanelProps {
  title: string;
  more: string;
  onMore: () => void;
  children: React.ReactNode;
}

export function Panel({ title, more, onMore, children }: PanelProps) {
  return (
    <section className="panel">
      <div className="sec-head">
        <div className="sec-title">{title}</div>
        <button className="sec-more" type="button" onClick={onMore}>
          {more}
        </button>
      </div>
      {children}
    </section>
  );
}
