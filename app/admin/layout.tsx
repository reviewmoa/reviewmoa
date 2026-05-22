import type React from "react";
import { AdminAuthGate } from "@/components/admin/adminAuthGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
