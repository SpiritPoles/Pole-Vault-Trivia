import { useState } from "react";
import { useOpenPools } from "../hooks/useOpenPools";
import { createPool, joinPoolById } from "../lib/poolActions";
import { POOL_TIERS } from "../constants";
import type { Session } from "../types";

interface OpenPoolsScreenProps {
  displayName: string;
  onEntered: (session: Session) => void;
  onBack: () => void;
}

function tierLabel(maxPlayers: number) {
  return POOL_TIERS.find((t) => t.maxPlayers === maxPlayers)?.label ?? `${maxPlayers} players`;
}

export function OpenPoolsScreen({ displayName, onEntered, onBack }: OpenPoolsScreenProps) {
  const { pools } = useOpenPools();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(maxPlayers: number) {
    setBusy(true);
    setError(null);
    try {
      onEntered(await createPool(displayName, maxPlayers));
    } catch (e: any) {
      setError(e.message ?? "Could not create pool.");
      setBusy(false);
    }
  }

  async function handleJoin(poolId: string) {
    setBusy(true);
    setError(null);
    try {
      onEntered(await joinPoolById(poolId, displayName));
    } catch (e: any) {
      setError(e.message ?? "Could not join that pool.");
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div className="card" style={{ maxWidth: 480 }}>
        <p className="eyebrow">Playing as {displayName}</p>
        <h1 style={{ fontSize: 24, margin: "6px 0 20px" }}>Pool play</h1>

        <p style={{ color: "var(--text)", marginBottom: 10 }}>Start a new pool</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {POOL_TIERS.map((tier) => (
            <button
              key={tier.maxPlayers}
              className="btn-secondary"
              disabled={busy}
              onClick={() => handleCreate(tier.maxPlayers)}
              style={{ flex: "1 1 auto" }}
            >
              {tier.label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <p style={{ color: "var(--text)", marginBottom: 10 }}>
            Or join an open pool ({pools.length} waiting)
          </p>
          {pools.length === 0 && (
            <p style={{ fontSize: 14 }}>No open pools right now -- start one above.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pools.map((p) => (
              <button
                key={p.id}
                className="btn-secondary"
                disabled={busy}
                onClick={() => handleJoin(p.id)}
                style={{ display: "flex", justifyContent: "space-between", width: "100%" }}
              >
                <span>{tierLabel(p.max_players)}</span>
                <span>
                  {p.player_count}/{p.max_players} joined
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="error-text" style={{ marginTop: 16 }}>{error}</p>}

        <button
          className="btn-secondary"
          style={{ width: "100%", marginTop: 20, border: "none" }}
          onClick={onBack}
          disabled={busy}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
}
