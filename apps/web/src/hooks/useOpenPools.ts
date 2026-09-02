import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { OpenPool } from "../types";

export function useOpenPools() {
  const [pools, setPools] = useState<OpenPool[]>([]);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.from("open_pools").select("*");
    if (!error && data) setPools(data as OpenPool[]);
  }, []);

  useEffect(() => {
    refetch();

    // open_pools is a view (can't be replicated directly) -- refetch it
    // whenever a pool or player row changes anywhere.
    const channel = supabase
      .channel("open-pools-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "pools" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, refetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { pools, refetch };
}
