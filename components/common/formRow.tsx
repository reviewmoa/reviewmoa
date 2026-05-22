import type React from "react";

interface FormRowProps {
  label: string;
  children: React.ReactNode;
}

export function FormRow({ label, children }: FormRowProps) {
  return (
    <div className="form-row">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}
