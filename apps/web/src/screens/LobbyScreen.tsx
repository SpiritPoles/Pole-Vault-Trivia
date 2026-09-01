import { useState } from "react";
import { supabase } from "../supabaseClient";
import type { Player, Pool } from "../types";

interface LobbyScreenProps {
  pool: Pool;
  players: Player[];
  isHost: boolean;
  onStart: () => Promise<void>;
}

export function LobbyScreen({ pool, players, isHost, onStart }: LobbyScreenProps) {
  const [starting, setStarting] = useState(false);

  return (
    <div className="screen">
      <div className="card">
        <p className="eyebrow">Pool code</p>
        <h1 style={{ fontSize: 40, letterSpacing: "0.08em", marginBottom: 20 }}>{pool.code}</h1>

        <p style={{ marginBottom: 8, color: "var(--text)" }}>
          {players.length} {players.length === 1 ? "player" : "players"} in
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
          <button
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={starting || players.length < 1}
            onClick={async () => {
              setStarting(true);
              await onStart();
              setStarting(false);
            }}
          >
            {starting ? "Starting..." : "Start game"}
          </button>
        ) : (
          <p>Waiting for the host to start the round&hellip;</p>
        )}
      </div>
    </div>
  );
}

export async function createFirstRound(
  poolId: string,
  questionId: string,
  durationSeconds: number
) {
  const endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
  await supabase.from("rounds").insert({
    pool_id: poolId,
    question_id: questionId,
    round_number: 1,
    ends_at: endsAt,
  });
  await supabase.from("pools").update({ status: "active" }).eq("id", poolId);
}
