import type React from "react";

export function CardSection({
  icon,
  label,
  body,
  children
}: {
  icon: string;
  label: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="card-section">
      <div className="cs-label">
        <span className="cs-emoji">{icon}</span> {label}
      </div>
      <div className="cs-body mentor">{body}</div>
      {children}
    </section>
  );
}
