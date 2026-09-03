function MatchScoreBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const scores = [
    ["Geography", breakdown.geo],
    ["Sector", breakdown.sector],
    ["Capacity", breakdown.capacity],
  ];

  return (
    <div className="match-breakdown">
      <div className="breakdown-title">
        MATCH BREAKDOWN
      </div>

      {scores.map(([label, score]) => (
        <div
          key={label}
          className="breakdown-row"
        >
          <span>{label}</span>

          <div className="breakdown-track">
            <div
              style={{
                width: `${score * 100}%`,
              }}
            />
          </div>

          <strong>
            {(score * 100).toFixed(0)}%
          </strong>
        </div>
      ))}
    </div>
  );
}

export default MatchScoreBreakdown;