import { useState } from "react";
import { minPlayersToStart } from "../constants";
import type { Player, Pool } from "../types";

interface LobbyScreenProps {
  pool: Pool;
  players: Player[];
  isHost: boolean;
  onStart: () => Promise<void>;
}

export function LobbyScreen({ pool, players, isHost, onStart }: LobbyScreenProps) {
  const [starting, setStarting] = useState(false);
  const minToStart = minPlayersToStart(pool.max_players);
  const canStart = players.length >= minToStart;

  return (
    <div className="screen">
      <div className="card">
        <p className="eyebrow">Pool code</p>
        <h1 style={{ fontSize: 40, letterSpacing: "0.08em", marginBottom: 20 }}>{pool.code}</h1>

        <p style={{ marginBottom: 8, color: "var(--text)" }}>
          {players.length}/{pool.max_players} players in
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--surface-raised)",
                borderRadius: 4,
              }}
            >
              <span>{p.display_name}</span>
              {i === 0 && <span className="eyebrow">Host</span>}
            </div>
          ))}
        </div>

        {isHost ? (
          <>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={starting || !canStart}
              onClick={async () => {
                setStarting(true);
                await onStart();
                setStarting(false);
              }}
            >
              {starting ? "Starting..." : "Start game"}
            </button>
            {!canStart && (
              <p style={{ marginTop: 10, fontSize: 13, textAlign: "center" }}>
                Need at least {minToStart} players to start
              </p>
            )}
          </>
        ) : (
          <p>Waiting for the host to start the round&hellip;</p>
        )}
      </div>
    </div>
  );
}
