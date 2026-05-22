"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ExitIcon } from "@/public/icons";

export function AdminExitBtn() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button className="admin-nav-item admin-exit" type="button" onClick={signOut}>
      <ExitIcon />
      로그아웃
    </button>
  );
}
