import { useLeaderboard } from "../hooks/useLeaderboard";

interface LeaderboardScreenProps {
  poolId: string;
  onPlayAgain: () => void;
}

export function LeaderboardScreen({ poolId, onPlayAgain }: LeaderboardScreenProps) {
  const { rows } = useLeaderboard(poolId);
  const sorted = [...rows].sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="screen">
      <div className="card">
        <p className="eyebrow">Final standings</p>
        <h1 style={{ fontSize: 28, margin: "6px 0 24px" }}>Game over</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((r, i) => (
            <div
              key={r.player_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                background: i === 0 ? "var(--amber-dim)" : "var(--surface-raised)",
                borderRadius: 4,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="eyebrow" style={{ color: i === 0 ? "var(--amber)" : "var(--text-dim)" }}>
                  {i + 1}
                </span>
                {r.display_name}
              </span>
              <span style={{ fontFamily: "var(--font-display)" }}>{r.total_points}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ width: "100%", marginTop: 24 }} onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  );
}
