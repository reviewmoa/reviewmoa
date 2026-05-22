import type { ReactNode } from "react";
import { PublicTopbar } from "@/components/publicTopbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicTopbar />
      {children}
    </>
  );
}
