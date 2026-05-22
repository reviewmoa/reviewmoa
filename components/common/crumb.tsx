export function Crumb({ items }: { items: Array<[string, (() => void)?]> }) {
  return (
    <div className="crumb">
      {items.map(([label, onClick], index) => (
        <span key={`${label}-${index}`} className="crumb-part">
          {index > 0 ? <span className="sep">/</span> : null}
          {onClick ? (
            <button type="button" onClick={onClick}>
              {label}
            </button>
          ) : (
            <span className="cur">{label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
