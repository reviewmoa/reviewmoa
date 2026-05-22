"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminNav } from "@/components/common";
import { BoxIcon, ExitIcon, MenuIcon, SparkIcon } from "@/public/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="view active">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side-brand">관리자 콘솔</div>
          <AdminNav
            active={pathname === "/admin"}
            onClick={() => router.push("/admin")}
            icon={<MenuIcon />}
            label="미션 관리"
          />
          <AdminNav
            active={pathname === "/admin/generate"}
            onClick={() => router.push("/admin/generate")}
            icon={<SparkIcon />}
            label="규칙카드 생성"
          />
          <AdminNav
            active={pathname === "/admin/jobs"}
            onClick={() => router.push("/admin/jobs")}
            icon={<BoxIcon />}
            label="작업 관리"
          />
          <button className="admin-nav-item admin-exit" type="button" onClick={() => router.push("/")}>
            <ExitIcon />
            공개 페이지로
          </button>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
