"use client";

import { useEffect, useState } from "react";
import { fetchGenerationJobs, type GenerationJobListItem } from "@/lib/reviewmoa/clientApi";
import { JobRow } from "@/components/admin";

export default function Page() {
  const [jobs, setJobs] = useState<GenerationJobListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = () => {
    fetchGenerationJobs().then(setJobs).catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    loadJobs();
  }, []);

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
        </div>
        {error ? <div className="empty">작업 목록을 불러오지 못했어요. {error}</div> : null}
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} onRetry={loadJobs} />
        ))}
      </div>
    </>
  );
}
