"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMissions } from "@/lib/reviewmoa/clientApi";
import type { MissionSummary } from "@/lib/reviewmoa/types";
import { pathForMission } from "@/utils";
import { Crumb, MissionStat, PageTitle } from "@/components/common";

const TRACKS = ["백엔드", "안드로이드", "프론트엔드"] as const;

type MissionTrack = (typeof TRACKS)[number];

function getMissionTrack(mission: MissionSummary): MissionTrack {
  const value = `${mission.slug} ${mission.name} ${mission.githubRepo}`.toLowerCase();

  if (value.includes("android")) {
    return "안드로이드";
  }

  if (value.includes("roomescape")) {
    return "백엔드";
  }

  return "프론트엔드";
}

function formatPrRange(mission: MissionSummary) {
  if (mission.prFrom && mission.prTo) {
    return `#${mission.prFrom}-${mission.prTo}`;
  }

  return "-";
}

export default function Page() {
  const router = useRouter();
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions().then(setMissions).catch((err: Error) => setError(err.message));
  }, []);

  const grouped = useMemo(
    () =>
      missions.reduce<Record<MissionTrack, MissionSummary[]>>(
        (acc, mission) => {
          const track = getMissionTrack(mission);
          acc[track] = [...acc[track], mission];
          return acc;
        },
        {
          백엔드: [],
          안드로이드: [],
          프론트엔드: []
        }
      ),
    [missions]
  );

  return (
    <div className="view active">
      <div className="page">
        <Crumb items={[["홈", () => router.push("/")], ["미션"]]} />
        <PageTitle title="미션" sub="미션을 선택하면 PR 요청자 목록을 볼 수 있어요." />
        {error ? <div className="empty">미션을 불러오지 못했어요. {error}</div> : null}
        <div className="missions-list">
          {TRACKS.map((track) => (
            <section key={track} className="level-block">
              <div className="level-tag">{track}</div>
              <div className="mission-grid">
                {grouped[track].map((mission) => (
                  <button
                    key={mission.slug}
                    className="mission-card"
                    type="button"
                    onClick={() => router.push(pathForMission(mission.slug))}
                  >
                    <span className="mission-card-head">
                      <span>
                        <span className="mission-repo">{mission.githubRepo}</span>
                        <span className="mission-title">{mission.name}</span>
                      </span>
                    </span>
                    <span className="mission-tags">
                      <span className="tag-mini">{mission.githubOwner}</span>
                      <span className="tag-mini">{mission.githubRepo}</span>
                    </span>
                    <span className="mission-card-stats">
                      <MissionStat value={mission.cardCount.toLocaleString()} label="규칙카드" />
                      <MissionStat value={String(mission.requesterCount)} label="요청자" />
                      <MissionStat value={formatPrRange(mission)} label="PR 범위" mono />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
