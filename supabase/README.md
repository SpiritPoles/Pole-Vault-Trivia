# Supabase setup — Pole Vault Trivia

## Apply the schema

**Option A — Supabase CLI (recommended, keeps this in your GitHub repo):**
```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```
This runs the files in `migrations/` in order (0001, 0002, 0003).

**Option B — SQL editor in the Supabase dashboard:**
Paste and run `0001_init_schema.sql`, then `0002_rls_policies.sql`, then
`0003_submit_answer_function.sql`, in that order. Then optionally run
`seed.sql` to load sample questions.

## Enable Realtime

In the Supabase dashboard: Database → Replication → turn on replication
for the `answers` table (views like `leaderboard` can't be replicated
directly — the client re-fetches `leaderboard` whenever it sees a new
row land in `answers`).

## What the client will call

- `supabase.from('pools').insert(...)` — create a pool, get back its `code`
- `supabase.from('pools').select().eq('code', enteredCode)` — join by code
- `supabase.from('players').insert(...)` — join a pool with a display name
- `supabase.from('questions_public').select()` — pull a question (no answer key exposed)
- `supabase.rpc('submit_answer', { p_round_id, p_player_id, p_choice })` — submit an answer, server scores it
- `supabase.from('leaderboard').select().eq('pool_id', poolId)` — current standings
- `supabase.channel('pool:' + poolId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers' }, refetchLeaderboard)` — live updates

## Notes / things to revisit

- **No Supabase Auth yet.** Players are trusted client-side after joining
  (their `player_id` is just stored in local state). Fine for a small
  friends/team pool; if this ever goes public-facing, switch to Supabase
  anonymous auth so `player_id` is tied to a real session.
- **Scoring** lives in `submit_answer()`: 100 points for a correct answer,
  plus up to 50 speed-bonus points based on time remaining in the round.
  Tune this however you like.
- **Seed questions** are a starting set to develop against — double-check
  anything record-related before using them for a real event.
