import type React from "react";

interface CardSectionProps {
  icon: string;
  label: string;
  body: string;
  children?: React.ReactNode;
}

export function CardSection({ icon, label, body, children }: CardSectionProps) {
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
