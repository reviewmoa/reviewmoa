interface MissionRowProps {
  name: string;
  owner: string;
  repo: string;
  count: string;
}

export function MissionRow({ name, owner, repo, count }: MissionRowProps) {
  return (
    <div className="job-row">
      <div className="job-mission">{name}</div>
      <div className="job-range">{owner}</div>
      <div className="job-range">{repo}</div>
      <div className="job-range">{count}</div>
      <div>
        <span className="status-badge status-completed">
          <span className="status-dot" />
          활성
        </span>
      </div>
    </div>
  );
}
