import { cx } from "@/utils";

interface RailRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function RailRow({ label, value, mono = false }: RailRowProps) {
  return (
    <div className="rail-meta-row">
      <span className="rail-meta-key">{label}</span>
      <span className={cx("rail-meta-val", mono && "mono")}>{value}</span>
    </div>
  );
}
