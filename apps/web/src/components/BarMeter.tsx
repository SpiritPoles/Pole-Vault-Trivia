interface BarMeterProps {
  currentRound: number;
  totalRounds: number;
}

/**
 * A vertical standard with a crossbar that rises with each round,
 * echoing the sport's central act: raising the bar.
 */
export function BarMeter({ currentRound, totalRounds }: BarMeterProps) {
  const trackHeight = 160;
  const pct = totalRounds > 0 ? currentRound / totalRounds : 0;
  const barY = trackHeight - pct * trackHeight;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      role="img"
      aria-label={`Round ${currentRound} of ${totalRounds}`}
    >
      <svg width="64" height={trackHeight + 20} viewBox={`0 0 64 ${trackHeight + 20}`}>
        <line x1="12" y1="4" x2="12" y2={trackHeight + 4} stroke="#263252" strokeWidth="3" />
        <line x1="52" y1="4" x2="52" y2={trackHeight + 4} stroke="#263252" strokeWidth="3" />
        <line
          x1="8"
          y1={barY + 4}
          x2="56"
          y2={barY + 4}
          stroke="#f2a63c"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transition: "y1 0.4s ease, y2 0.4s ease" }}
        />
      </svg>
      <span className="eyebrow">
        Round {currentRound}/{totalRounds}
      </span>
    </div>
  );
}
