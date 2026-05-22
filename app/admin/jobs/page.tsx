"use client";

import { JOBS } from "@/components/data";
import { JobRow } from "@/components/adminJob";

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
