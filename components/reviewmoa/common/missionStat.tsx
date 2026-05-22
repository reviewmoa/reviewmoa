import { cx } from "../utils";

export function MissionStat({
  value,
  label,
  mono = false
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  return (
    <span>
      <span className={cx("mc-stat-num", mono && "mc-stat-mono")}>{value}</span>
      <span className="mc-stat-label">{label}</span>
    </span>
  );
}
