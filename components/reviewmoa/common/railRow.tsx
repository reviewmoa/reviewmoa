import { cx } from "../utils";

export function RailRow({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rail-meta-row">
      <span className="rail-meta-key">{label}</span>
      <span className={cx("rail-meta-val", mono && "mono")}>{value}</span>
    </div>
  );
}
