"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CheckIcon, SearchIcon, ShieldIcon } from "@/public/icons";
import { cx } from "./utils";

const navItems = [
  { href: "/", label: "홈", match: (pathname: string) => pathname === "/" },
  { href: "/missions", label: "미션", match: (pathname: string) => pathname.startsWith("/missions") },
  { href: "/categories", label: "카테고리", match: (pathname: string) => pathname.startsWith("/categories") },
  { href: "/tagrank", label: "태그 랭킹", match: (pathname: string) => pathname === "/tagrank" },
  { href: "/progress", label: "발전률 랭킹", match: (pathname: string) => pathname === "/progress" },
  { href: "/random", label: "랜덤 카드", match: (pathname: string) => pathname === "/random" }
];

export function PublicTopbar() {
  const pathname = usePathname();
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">리</span>
            <span>
              리뷰<em>모아</em>
            </span>
          </Link>
          <nav className="nav-menu" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={cx("nav-item", item.match(pathname) && "active")}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            className="nav-search"
            type="button"
            onClick={() => showToast("검색은 데모에서 생략되었어요")}
          >
            <SearchIcon />
            카드 검색...
          </button>
          <Link className="admin-btn" href="/admin">
            <ShieldIcon />
            관리자
          </Link>
        </div>
      </div>
      <div className={cx("toast", toast && "show")}>
        <CheckIcon />
        {toast}
      </div>
    </>
  );
}
