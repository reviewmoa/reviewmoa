import type { ViewName } from "../types";
import { cx } from "../utils";
import { SearchIcon, ShieldIcon } from "@/public/icons";

export function Topbar({
  activeView,
  navItems,
  go,
  showToast
}: {
  activeView: ViewName;
  navItems: Array<[ViewName, string]>;
  go: (view: ViewName) => void;
  showToast: (message: string) => void;
}) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button className="brand" type="button" onClick={() => go("home")}>
          <span className="brand-mark">리</span>
          <span>
            리뷰<em>모아</em>
          </span>
        </button>
        <nav className="nav-menu" aria-label="주요 메뉴">
          {navItems.map(([name, label]) => (
            <button
              key={name}
              className={cx("nav-item", activeView === name && "active")}
              type="button"
              onClick={() => go(name)}
            >
              {label}
            </button>
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
        <button className="admin-btn" type="button" onClick={() => go("admin")}>
          <ShieldIcon />
          관리자
        </button>
      </div>
    </div>
  );
}
