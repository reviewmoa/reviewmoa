interface HeroStatProps {
  value: string;
  label: string;
}

export function HeroStat({ value, label }: HeroStatProps) {
  return (
    <div className="hero-stat">
      <div className="hero-stat-num">{value}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}
