"use client";

import { retryGenerationJob, type GenerationJobListItem } from "@/lib/reviewmoa/clientApi";
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
  job: GenerationJobListItem;
  onRetry?: () => void;
}

export function JobRow({ job, onRetry }: JobRowProps) {
  const cls = job.status === "partial_failed" ? "partial" : job.status;
  const canRetry = job.status === "failed" || job.status === "partial_failed";
  const result =
    job.status === "pending"
      ? "대기 중"
      : `${job.successPrCount}/${job.totalPrCount} 성공 · 카드 ${job.resultCardCount}개`;

  const retry = async () => {
    await retryGenerationJob(job.id);
    onRetry?.();
  };

  return (
    <div className="job-row">
      <div className="job-mission">{job.mission.name || job.mission.slug}</div>
      <div className="job-range">#{job.prStart}-{job.prEnd}</div>
      <div>
        <span className={`status-badge status-${cls}`}>
          <span className={cx("status-dot", job.status === "running" && "pulse")} />
          {STATUS_LABELS[job.status]}
        </span>
      </div>
      <div className="job-range">{result}</div>
      <div>
        {canRetry ? (
          <button
            className="retry-btn"
            type="button"
            onClick={retry}
          >
            <RetryIcon />
            재시도
          </button>
        ) : null}
      </div>
    </div>
  );
}
