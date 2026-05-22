import type { ReactNode } from "react";
import { PublicTopbar } from "@/components/reviewmoa/publicTopbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicTopbar />
      {children}
    </>
  );
}
