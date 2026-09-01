import { useState } from "react";
import { supabase } from "../supabaseClient";
import type { Session } from "../types";

interface JoinScreenProps {
  onJoined: (session: Session) => void;
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function JoinScreen({ onJoined }: JoinScreenProps) {
  const [mode, setMode] = useState<"join" | "create">("join");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return setError("Enter a display name first.");
    setBusy(true);
    setError(null);
    try {
      const { data: pool, error: poolErr } = await supabase
        .from("pools")
        .insert({ code: randomCode(), name: "Pole Vault Trivia" })
        .select()
        .single();
      if (poolErr || !pool) throw poolErr ?? new Error("Could not create pool");

      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ pool_id: pool.id, display_name: name.trim() })
        .select()
        .single();
      if (playerErr || !player) throw playerErr ?? new Error("Could not join pool");

      onJoined({ pool, player });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) return setError("Enter a display name first.");
    if (!code.trim()) return setError("Enter a pool code.");
    setBusy(true);
    setError(null);
    try {
      const { data: pool, error: poolErr } = await supabase
        .from("pools")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .single();
      if (poolErr || !pool) throw new Error("No pool found with that code.");

      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ pool_id: pool.id, display_name: name.trim() })
        .select()
        .single();
      if (playerErr || !player) {
        throw new Error(
          playerErr?.message.includes("unique")
            ? "That name is already taken in this pool."
            : "Could not join pool."
        );
      }

      onJoined({ pool, player });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div className="card">
        <p className="eyebrow">Bar Raiser</p>
        <h1 style={{ fontSize: 28, marginTop: 6, marginBottom: 20 }}>Pole vault trivia</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            className={mode === "join" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("join")}
            style={{ flex: 1 }}
          >
            Join a pool
          </button>
          <button
            className={mode === "create" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("create")}
            style={{ flex: 1 }}
          >
            Start a pool
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
          />
          {mode === "join" && (
            <input
              type="text"
              placeholder="Pool code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          )}
          <button
            className="btn-primary"
            disabled={busy}
            onClick={mode === "join" ? handleJoin : handleCreate}
          >
            {busy ? "One moment..." : mode === "join" ? "Join pool" : "Create pool"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
}
