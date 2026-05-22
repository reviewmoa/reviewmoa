interface MissionRowProps {
  name: string;
  owner: string;
  repo: string;
  count: string;
  isActive: boolean;
}

export function MissionRow({ name, owner, repo, count, isActive }: MissionRowProps) {
  return (
    <div className="job-row">
      <div className="job-mission">{name}</div>
      <div className="job-range">{owner}</div>
      <div className="job-range">{repo}</div>
      <div className="job-range">{count}</div>
      <div>
        <span className={`status-badge status-${isActive ? "completed" : "pending"}`}>
          <span className="status-dot" />
          {isActive ? "활성" : "비활성"}
        </span>
      </div>
    </div>
  );
}
