"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "./adminShell";

type AuthState = "checking" | "authorized" | "unauthorized";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("checking");
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/reset-password";

  useEffect(() => {
    if (isAuthPage) {
      setAuthState("authorized");
      return;
    }

    let isMounted = true;

    fetch("/api/admin/me", {
      credentials: "same-origin"
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setAuthState("authorized");
          return;
        }

        setAuthState("unauthorized");
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setAuthState("unauthorized");
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (authState === "checking") {
    return (
      <AdminShell>
        <div className="empty">관리자 권한을 확인하고 있어요.</div>
      </AdminShell>
    );
  }

  if (authState === "authorized") {
    return <AdminShell>{children}</AdminShell>;
  }

  return null;
}
