import { useState } from "react";

interface LandingScreenProps {
  onChoose: (name: string, mode: "solo" | "pool") => void;
}

export function LandingScreen({ onChoose }: LandingScreenProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handle(mode: "solo" | "pool") {
    if (!name.trim()) return setError("Enter a display name first.");
    setError(null);
    onChoose(name.trim(), mode);
  }

  return (
    <div className="screen">
      <div className="card">
        <p className="eyebrow">Bar Raiser</p>
        <h1 style={{ fontSize: 28, marginTop: 6, marginBottom: 20 }}>Pole vault trivia</h1>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          style={{ width: "100%", marginBottom: 12 }}
        />
        {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-primary" onClick={() => handle("pool")}>
            Pool play
          </button>
          <button className="btn-secondary" onClick={() => handle("solo")}>
            Play solo
          </button>
        </div>
      </div>
    </div>
  );
}
