import { cx } from "@/utils";

interface MissionStatProps {
  value: string;
  label: string;
  mono?: boolean;
}

export function MissionStat({ value, label, mono = false }: MissionStatProps) {
  return (
    <span>
      <span className={cx("mc-stat-num", mono && "mc-stat-mono")}>{value}</span>
      <span className="mc-stat-label">{label}</span>
    </span>
  );
}
