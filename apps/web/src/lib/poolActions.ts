import { supabase } from "../supabaseClient";
import { ROUND_DURATION_SECONDS } from "../constants";
import type { Player, Pool, Session } from "../types";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createPool(displayName: string, maxPlayers: number): Promise<Session> {
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .insert({ code: randomCode(), name: "Pole Vault Trivia", max_players: maxPlayers })
    .select()
    .single();
  if (poolErr || !pool) throw poolErr ?? new Error("Could not create pool");

  const { data: player, error: playerErr } = await supabase
    .from("players")
    .insert({ pool_id: pool.id, display_name: displayName })
    .select()
    .single();
  if (playerErr || !player) throw playerErr ?? new Error("Could not join pool");

  return { pool: pool as Pool, player: player as Player };
}

export async function joinPoolById(poolId: string, displayName: string): Promise<Session> {
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .select("*")
    .eq("id", poolId)
    .single();
  if (poolErr || !pool) throw new Error("That pool isn't available anymore.");

  const { data: player, error: playerErr } = await supabase
    .from("players")
    .insert({ pool_id: pool.id, display_name: displayName })
    .select()
    .single();
  if (playerErr || !player) {
    throw new Error(
      playerErr?.message.includes("unique")
        ? "That name is already taken in this pool."
        : "Could not join pool -- it may have just filled up."
    );
  }

  return { pool: pool as Pool, player: player as Player };
}

export async function joinPoolByCode(code: string, displayName: string): Promise<Session> {
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();
  if (poolErr || !pool) throw new Error("No pool found with that code.");
  return joinPoolById(pool.id, displayName);
}

export async function pickNextQuestionId(excludeIds: string[] = []): Promise<string> {
  const { data, error } = await supabase.from("questions_public").select("id");
  if (error || !data || data.length === 0) throw new Error("No questions available.");
  const remaining = data.filter((q) => !excludeIds.includes(q.id));
  const pool = remaining.length > 0 ? remaining : data; // recycle if pool runs out
  return pool[Math.floor(Math.random() * pool.length)].id;
}

/** Solo practice: a pool sized for one player that starts itself immediately. */
export async function createSoloSession(displayName: string): Promise<Session> {
  const session = await createPool(displayName, 1);
  const questionId = await pickNextQuestionId();

  const endsAt = new Date(Date.now() + ROUND_DURATION_SECONDS * 1000).toISOString();
  await supabase.from("rounds").insert({
    pool_id: session.pool.id,
    question_id: questionId,
    round_number: 1,
    ends_at: endsAt,
  });
  await supabase.from("pools").update({ status: "active" }).eq("id", session.pool.id);

  return session;
}
