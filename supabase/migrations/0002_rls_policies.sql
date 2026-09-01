-- 0002_rls_policies.sql
-- MVP trust model: no Supabase Auth, players are identified by id stored
-- client-side after joining. RLS mainly stops the client from reading
-- correct_choice or writing arbitrary scores -- not from impersonating
-- another player. Good enough for a friends/team pool game; tighten with
-- Supabase Auth (anonymous sign-in) if you open this up publicly.

alter table pools enable row level security;
alter table players enable row level security;
alter table questions enable row level security;
alter table rounds enable row level security;
alter table answers enable row level security;

-- pools: anyone can look up a pool by code, or create one
create policy "pools_select_all" on pools for select using (true);
create policy "pools_insert_all" on pools for insert with check (true);
create policy "pools_update_all" on pools for update using (true); -- host advances status

-- players: anyone can see who's in a pool, and join a pool
create policy "players_select_all" on players for select using (true);
create policy "players_insert_all" on players for insert with check (true);

-- rounds: anyone can see rounds, host client creates them
create policy "rounds_select_all" on rounds for select using (true);
create policy "rounds_insert_all" on rounds for insert with check (true);

-- questions: no direct policies -> anon/authenticated get zero access to
-- the base table (including correct_choice). Reads go through the view below.

-- answers: no direct policies -> all writes must go through the
-- submit_answer() function in 0003, so points/is_correct can't be forged.
-- No select policy either; read scores via the leaderboard view below.

-- ---- Safe public views ----

-- Question data without the answer key
create view questions_public as
  select id, prompt, choices, category, difficulty, image_url, created_at
  from questions;

grant select on questions_public to anon, authenticated;

-- Live leaderboard, safe to poll or re-fetch after a realtime event
create view leaderboard as
  select
    p.pool_id,
    p.id as player_id,
    p.display_name,
    coalesce(sum(a.points_awarded), 0) as total_points,
    coalesce(count(*) filter (where a.is_correct), 0) as correct_answers
  from players p
  left join answers a on a.player_id = p.id
  group by p.pool_id, p.id, p.display_name;

grant select on leaderboard to anon, authenticated;
