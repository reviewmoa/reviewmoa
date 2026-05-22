"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { SearchIcon, ShieldIcon } from "@/public/icons";
import { cx } from "@/utils";

const NAV_ITEMS = [
  { href: "/", label: "홈", match: (pathname: string) => pathname === "/" },
  { href: "/missions", label: "미션", match: (pathname: string) => pathname.startsWith("/missions") },
  { href: "/categories", label: "카테고리", match: (pathname: string) => pathname.startsWith("/categories") },
  { href: "/tagrank", label: "태그 랭킹", match: (pathname: string) => pathname === "/tagrank" },
  { href: "/progress", label: "발전률 랭킹", match: (pathname: string) => pathname === "/progress" },
  { href: "/random", label: "랜덤 카드", match: (pathname: string) => pathname === "/random" }
];

export function PublicTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">리</span>
          <span>
            리뷰<em>모아</em>
          </span>
        </Link>
        <nav className="nav-menu" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              className={cx("nav-item", item.match(pathname) && "active")}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form className="nav-search" role="search" onSubmit={submitSearch}>
          <SearchIcon />
          <input
            aria-label="카드 검색"
            className="nav-search-input"
            placeholder="카드 검색..."
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        <Link className="admin-btn" href="/admin">
          <ShieldIcon />
          관리자
        </Link>
      </div>
    </div>
  );
}
