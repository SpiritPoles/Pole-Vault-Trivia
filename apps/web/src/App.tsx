import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { usePoolState } from "./hooks/usePoolState";
import { JoinScreen } from "./screens/JoinScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { ROUND_DURATION_SECONDS, SESSION_STORAGE_KEY } from "./constants";
import type { Session } from "./types";

async function pickNextQuestionId(excludeIds: string[]): Promise<string> {
  const { data, error } = await supabase.from("questions_public").select("id");
  if (error || !data || data.length === 0) throw new Error("No questions available.");
  const remaining = data.filter((q) => !excludeIds.includes(q.id));
  const pool = remaining.length > 0 ? remaining : data; // recycle if pool runs out
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  function handleJoined(s: Session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
    setSession(s);
  }

  function handleLeave() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }

  if (!loaded) return null;
  if (!session) return <JoinScreen onJoined={handleJoined} />;

  return <GameShell session={session} onLeave={handleLeave} />;
}

function GameShell({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const { pool, players, rounds, currentRound, hostPlayerId } = usePoolState(session.pool);
  const isHost = hostPlayerId === session.player.id;
  const askedQuestionIds = rounds.map((r) => r.question_id);

  async function startGame() {
    const questionId = await pickNextQuestionId(askedQuestionIds);
    const endsAt = new Date(Date.now() + ROUND_DURATION_SECONDS * 1000).toISOString();
    await supabase.from("rounds").insert({
      pool_id: pool.id,
      question_id: questionId,
      round_number: 1,
      ends_at: endsAt,
    });
    await supabase.from("pools").update({ status: "active" }).eq("id", pool.id);
  }

  async function advanceRound() {
    if (!currentRound) return;
    const questionId = await pickNextQuestionId(askedQuestionIds);
    const endsAt = new Date(Date.now() + ROUND_DURATION_SECONDS * 1000).toISOString();
    await supabase.from("rounds").insert({
      pool_id: pool.id,
      question_id: questionId,
      round_number: currentRound.round_number + 1,
      ends_at: endsAt,
    });
  }

  async function finishGame() {
    await supabase.from("pools").update({ status: "finished" }).eq("id", pool.id);
  }

  if (pool.status === "waiting") {
    return <LobbyScreen pool={pool} players={players} isHost={isHost} onStart={startGame} />;
  }

  if (pool.status === "active" && currentRound) {
    return (
      <QuestionScreen
        poolId={pool.id}
        round={currentRound}
        player={session.player}
        isHost={isHost}
        onAdvance={advanceRound}
        onFinish={finishGame}
      />
    );
  }

  if (pool.status === "finished") {
    return <LeaderboardScreen poolId={pool.id} onPlayAgain={onLeave} />;
  }

  return (
    <div className="screen">
      <p>Getting things ready&hellip;</p>
    </div>
  );
}
