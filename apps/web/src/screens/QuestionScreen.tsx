import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { BarMeter } from "../components/BarMeter";
import { ROUND_DURATION_SECONDS, TOTAL_ROUNDS } from "../constants";
import type { Player, QuestionPublic, Round } from "../types";

interface QuestionScreenProps {
  poolId: string;
  round: Round;
  player: Player;
  isHost: boolean;
  isSolo: boolean;
  onAdvance: () => Promise<void>;
  onFinish: () => Promise<void>;
}

export function QuestionScreen({
  poolId,
  round,
  player,
  isHost,
  isSolo,
  onAdvance,
  onFinish,
}: QuestionScreenProps) {
  const [question, setQuestion] = useState<QuestionPublic | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; points_awarded: number } | null>(
    null
  );
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION_SECONDS);
  const [advancing, setAdvancing] = useState(false);
  const { rows } = useLeaderboard(poolId);

  // Load this round's question fresh each time round.id changes
  useEffect(() => {
    setSelected(null);
    setResult(null);
    setQuestion(null);
    supabase
      .from("questions_public")
      .select("*")
      .eq("id", round.question_id)
      .single()
      .then(({ data }) => setQuestion(data as QuestionPublic));
  }, [round.id, round.question_id]);

  // Countdown driven by the round's server timestamp, not local elapsed time
  useEffect(() => {
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(round.ends_at).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [round.ends_at]);

  async function handleAnswer(choice: string) {
    if (selected || secondsLeft === 0) return;
    setSelected(choice);
    const { data, error } = await supabase.rpc("submit_answer", {
      p_round_id: round.id,
      p_player_id: player.id,
      p_choice: choice,
    });
    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      setResult(row);
    }
  }

  const isLastRound = round.round_number >= TOTAL_ROUNDS;
  const roundOver = secondsLeft === 0;

  // Solo games have no one to click "Next round" -- advance automatically
  // after a short pause so the player can see their result first.
  useEffect(() => {
    if (!isSolo || !roundOver || advancing) return;
    setAdvancing(true);
    const timer = setTimeout(async () => {
      if (isLastRound) await onFinish();
      else await onAdvance();
      setAdvancing(false);
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, roundOver, isLastRound]);

  return (
    <div className="screen">
      <div className="card" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <BarMeter currentRound={round.round_number} totalRounds={TOTAL_ROUNDS} />
          <div style={{ textAlign: "right" }}>
            <p className="eyebrow">Time left</p>
            <h2 style={{ fontSize: 32, color: roundOver ? "var(--coral)" : "var(--text)" }}>
              {secondsLeft}s
            </h2>
          </div>
        </div>

        <h1 style={{ fontSize: 22, textTransform: "none", margin: "20px 0" }}>
          {question?.prompt ?? "Loading question..."}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question?.choices.map((choice) => {
            const isPicked = selected === choice;
            const showFeedback = result && isPicked;
            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                disabled={!!selected || roundOver}
                className="btn-secondary"
                style={{
                  textAlign: "left",
                  borderColor: showFeedback
                    ? result!.is_correct
                      ? "var(--teal)"
                      : "var(--coral)"
                    : undefined,
                  color: showFeedback
                    ? result!.is_correct
                      ? "var(--teal)"
                      : "var(--coral)"
                    : undefined,
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {result && (
          <p style={{ marginTop: 16, color: result.is_correct ? "var(--teal)" : "var(--coral)" }}>
            {result.is_correct ? `Correct! +${result.points_awarded} points` : "Not quite."}
          </p>
        )}
        {selected && !result && <p style={{ marginTop: 16 }}>Locking in your answer&hellip;</p>}

        {!isSolo && (
          <div style={{ marginTop: 24, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Standings
            </p>
            {rows.slice(0, 5).map((r, i) => (
              <div key={r.player_id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>
                  {i + 1}. {r.display_name}
                </span>
                <span>{r.total_points}</span>
              </div>
            ))}
          </div>
        )}

        {isSolo && roundOver && (
          <p style={{ marginTop: 20, textAlign: "center" }}>
            {isLastRound ? "Calculating final score\u2026" : "Next question in a moment\u2026"}
          </p>
        )}

        {isHost && !isSolo && (
          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 20 }}
            disabled={!roundOver || advancing}
            onClick={async () => {
              setAdvancing(true);
              if (isLastRound) {
                await onFinish();
              } else {
                await onAdvance();
              }
              setAdvancing(false);
            }}
          >
            {!roundOver
              ? "Waiting for timer..."
              : advancing
              ? "Loading..."
              : isLastRound
              ? "Finish game"
              : "Next round"}
          </button>
        )}
      </div>
    </div>
  );
}
