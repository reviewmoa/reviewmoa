import type { ViewName } from "../types";
import { AdminNav } from "../common";
import { BoxIcon, ExitIcon, MenuIcon, SparkIcon } from "../icons";
import { AdminGenerateView } from "./adminGenerateView";
import { AdminJobsView } from "./adminJobsView";
import { AdminMissionsView } from "./adminMissionsView";

export function AdminView({
  go,
  pane,
  setPane,
  showToast
}: {
  go: (view: ViewName) => void;
  pane: "missions" | "generate" | "jobs";
  setPane: (pane: "missions" | "generate" | "jobs") => void;
  showToast: (message: string) => void;
}) {
  return (
    <div className="view active">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side-brand">관리자 콘솔</div>
          <AdminNav active={pane === "missions"} onClick={() => setPane("missions")} icon={<MenuIcon />} label="미션 관리" />
          <AdminNav active={pane === "generate"} onClick={() => setPane("generate")} icon={<SparkIcon />} label="규칙카드 생성" />
          <AdminNav active={pane === "jobs"} onClick={() => setPane("jobs")} icon={<BoxIcon />} label="작업 관리" />
          <button className="admin-nav-item admin-exit" type="button" onClick={() => go("home")}>
            <ExitIcon />
            공개 페이지로
          </button>
        </aside>
        <main className="admin-main">
          {pane === "missions" ? <AdminMissionsView showToast={showToast} /> : null}
          {pane === "generate" ? (
            <AdminGenerateView
              openJobs={() => {
                showToast("생성 요청을 보냈어요. 작업 관리에서 확인하세요");
                window.setTimeout(() => setPane("jobs"), 700);
              }}
            />
          ) : null}
          {pane === "jobs" ? <AdminJobsView showToast={showToast} /> : null}
        </main>
      </div>
    </div>
  );
}
