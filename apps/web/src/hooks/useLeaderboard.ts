import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { LeaderboardRow } from "../types";

export function useLeaderboard(poolId: string | undefined) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  const refetch = useCallback(async () => {
    if (!poolId) return;
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("pool_id", poolId)
      .order("total_points", { ascending: false });

    if (!error && data) setRows(data as LeaderboardRow[]);
  }, [poolId]);

  useEffect(() => {
    if (!poolId) return;
    refetch();

    // `leaderboard` is a view, so it can't be replicated directly --
    // listen for new answers instead and re-fetch the view each time.
    const channel = supabase
      .channel(`pool-answers-${poolId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "answers" },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poolId, refetch]);

  return { rows, refetch };
}
