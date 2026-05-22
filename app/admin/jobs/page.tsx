"use client";

import { JOBS } from "@/components/data";
import { RetryIcon } from "@/public/icons";
import { cx } from "@/utils";

const STATUS_LABELS: Record<string, string> = {
  completed: "완료",
  running: "진행 중",
  pending: "대기",
  failed: "실패",
  partial_failed: "부분 실패"
};

interface JobRowProps {
  job: (typeof JOBS)[number];
}

function JobRow({ job }: JobRowProps) {
  const cls = job.status === "partial_failed" ? "partial" : job.status;
  const canRetry = job.status === "failed" || job.status === "partial_failed";

  return (
    <div className="job-row">
      <div className="job-mission">{job.mission}</div>
      <div className="job-range">#{job.range}</div>
      <div>
        <span className={`status-badge status-${cls}`}>
          <span className={cx("status-dot", job.status === "running" && "pulse")} />
          {STATUS_LABELS[job.status]}
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
}

export default function Page() {
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
        {JOBS.map((job) => (
          <JobRow key={`${job.mission}-${job.range}`} job={job} />
        ))}
      </div>
    </>
  );
}
