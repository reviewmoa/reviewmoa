import { MissionRow } from "./missionRow";

const REGISTERED_MISSIONS = [
  { name: "roomescape-member", owner: "woowacourse", repo: "spring-roomescape...", count: "1,204" },
  { name: "shopping-order", owner: "woowacourse", repo: "spring-shopping...", count: "982" },
  { name: "coupon", owner: "woowacourse", repo: "java-coupon", count: "661" }
];

export function MissionTable() {
  return (
    <div className="job-table">
      <div className="job-row job-head">
        <div>미션명</div>
        <div>owner</div>
        <div>repo</div>
        <div>카드</div>
        <div>상태</div>
      </div>
      {REGISTERED_MISSIONS.map((mission) => (
        <MissionRow key={mission.name} {...mission} />
      ))}
    </div>
  );
}
