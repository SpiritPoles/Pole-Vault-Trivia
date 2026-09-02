export const TOTAL_ROUNDS = 8;
export const ROUND_DURATION_SECONDS = 20;
export const SESSION_STORAGE_KEY = "trivia_session";

export const SOLO_MAX_PLAYERS = 1;

export const POOL_TIERS: { label: string; maxPlayers: number }[] = [
  { label: "Duel (2 players)", maxPlayers: 2 },
  { label: "Small group (3-4)", maxPlayers: 4 },
  { label: "Large group (5-6)", maxPlayers: 6 },
];

// Host can start once this many players are in, even if the pool isn't
// full yet -- capped by the pool's actual size for small tiers like Duel.
export function minPlayersToStart(maxPlayers: number) {
  return Math.min(maxPlayers, 3);
}
