import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { Pool, Player, Round } from "../types";

export function usePoolState(initialPool: Pool) {
  const [pool, setPool] = useState<Pool>(initialPool);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  const refetchPool = useCallback(async () => {
    const { data } = await supabase.from("pools").select("*").eq("id", initialPool.id).single();
    if (data) setPool(data as Pool);
  }, [initialPool.id]);

  const refetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("pool_id", pool.id)
      .order("joined_at", { ascending: true });
    if (data) setPlayers(data as Player[]);
  }, [pool.id]);

  const refetchRounds = useCallback(async () => {
    const { data } = await supabase
      .from("rounds")
      .select("*")
      .eq("pool_id", pool.id)
      .order("round_number", { ascending: true });
    if (data) setRounds(data as Round[]);
  }, [pool.id]);

  useEffect(() => {
    refetchPool();
    refetchPlayers();
    refetchRounds();

    const channel = supabase
      .channel(`pool-state-${pool.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `pool_id=eq.${pool.id}` },
        refetchPlayers
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds", filter: `pool_id=eq.${pool.id}` },
        refetchRounds
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pools", filter: `id=eq.${pool.id}` },
        (payload) => setPool(payload.new as Pool)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pool.id, refetchPool, refetchPlayers, refetchRounds]);

  const currentRound = rounds[rounds.length - 1];
  // The player who joined earliest runs the show -- no separate host flag needed.
  const hostPlayerId = players[0]?.id;

  return { pool, players, rounds, currentRound, hostPlayerId, setPool, refetchRounds };
}
