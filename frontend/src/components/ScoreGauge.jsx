function scoreColor(score) {
  if (score >= 75) return "var(--score-high)";
  if (score >= 45) return "var(--score-mid)";
  return "var(--score-low)";
}

/**
 * Circular progress ring showing an ATS match score (0-100).
 * This is the app's signature visual — every screen that talks about
 * "how well does this resume match this job" renders through here.
 */
export default function ScoreGauge({ score = 0, size = 96, strokeWidth = 9, label = "Match" }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div className="score-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="score-gauge-value">
        <span className="score-gauge-number" style={{ color, fontSize: size * 0.26 }}>
          {Math.round(clamped)}
        </span>
        <span className="score-gauge-label">{label}</span>
      </div>
    </div>
  );
}
