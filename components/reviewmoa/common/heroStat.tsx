export function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="hero-stat">
      <div className="hero-stat-num">{value}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}
