"use client";

import { jobs } from "@/components/data";
import { RetryIcon } from "@/components/icons";
import { cx } from "@/components/utils";

export default function Page() {
  const labels: Record<string, string> = {
    completed: "완료",
    running: "진행 중",
    pending: "대기",
    failed: "실패",
    partial_failed: "부분 실패"
  };

  return (
    <>
      <div className="admin-title">작업 관리</div>
      <div className="admin-sub">
        생성 작업의 진행 상황과 PR별 성공·실패를 확인하고, 실패한 PR을 재시도해요.
      </div>
      <div className="job-table">
        <div className="job-row job-head">
          <div>미션</div>
          <div>PR 범위</div>
          <div>상태</div>
          <div>결과</div>
          <div />
        </div>
        {jobs.map((job) => {
          const cls = job.status === "partial_failed" ? "partial" : job.status;
          const canRetry = job.status === "failed" || job.status === "partial_failed";
          return (
            <div key={`${job.mission}-${job.range}`} className="job-row">
              <div className="job-mission">{job.mission}</div>
              <div className="job-range">#{job.range}</div>
              <div>
                <span className={`status-badge status-${cls}`}>
                  <span className={cx("status-dot", job.status === "running" && "pulse")} />
                  {labels[job.status]}
                </span>
              </div>
              <div className="job-range">{job.result}</div>
              <div>
                {canRetry ? (
                  <button
                    className="retry-btn"
                    type="button"
                    onClick={() => window.alert("실패한 PR을 재시도해요 (데모)")}
                  >
                    <RetryIcon />
                    재시도
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
