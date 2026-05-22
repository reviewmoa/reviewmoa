"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createGenerationJob, fetchMissions } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary } from "@/lib/reviewmoa/types";
import { FormRow } from "@/components/common";
import { ArrowIcon } from "@/public/icons";

export function GenerateForm() {
  const router = useRouter();
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [missionId, setMissionId] = useState("");
  const [prStart, setPrStart] = useState("");
  const [prEnd, setPrEnd] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMissions()
      .then((nextMissions) => {
        setMissions(nextMissions);
        setMissionId(nextMissions[0]?.id ?? "");
      })
      .catch((err: Error) => setMessage(err.message));
  }, []);

  const submitJob = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await createGenerationJob({
        missionId,
        prStart: Number(prStart),
        prEnd: Number(prEnd)
      });
      router.push("/admin/jobs");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "생성 요청에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <FormRow label="미션 선택">
        <select
          className="form-input"
          value={missionId}
          onChange={(event) => setMissionId(event.target.value)}
        >
          {missions.map((mission) => (
            <option key={mission.id} value={mission.id}>
              {mission.name}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="PR 번호 범위">
        <div className="form-range">
          <input
            className="form-input mono"
            placeholder="시작"
            value={prStart}
            onChange={(event) => setPrStart(event.target.value)}
          />
          <span className="dash">-</span>
          <input
            className="form-input mono"
            placeholder="끝"
            value={prEnd}
            onChange={(event) => setPrEnd(event.target.value)}
          />
        </div>
        <div className="form-hint">한 작업은 최대 100개 PR까지 처리해요</div>
      </FormRow>
      <button
        className="btn-primary"
        type="button"
        disabled={isSubmitting || !missionId}
        onClick={submitJob}
      >
        <ArrowIcon />
        {isSubmitting ? "요청 중" : "생성 요청 보내기"}
      </button>
      {message ? <p className="admin-help">{message}</p> : null}
      <p className="admin-help">
        요청을 보내면 작업 관리 화면으로 이동해요. 생성은 백그라운드에서 진행되고, 완료되면 상태가 업데이트돼요.
      </p>
    </div>
  );
}
