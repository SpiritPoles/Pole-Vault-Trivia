-- 0003_submit_answer_function.sql
-- The client never writes to `answers` directly (blocked by RLS in 0002).
-- Instead it calls this function, which checks correctness and computes
-- points on the server -- so no one can edit points_awarded in devtools.

create or replace function submit_answer(
  p_round_id uuid,
  p_player_id uuid,
  p_choice text
)
returns table (is_correct boolean, points_awarded int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct text;
  v_ends_at timestamptz;
  v_started_at timestamptz;
  v_seconds_left numeric;
  v_is_correct boolean;
  v_points int := 0;
begin
  select q.correct_choice, r.ends_at, r.started_at
    into v_correct, v_ends_at, v_started_at
  from rounds r
  join questions q on q.id = r.question_id
  where r.id = p_round_id;

  if v_correct is null then
    raise exception 'Round not found';
  end if;

  if now() > v_ends_at then
    raise exception 'Round has already ended';
  end if;

  v_is_correct := (p_choice = v_correct);

  if v_is_correct then
    -- 100 base points + up to 50 speed bonus for answering quickly
    v_seconds_left := greatest(extract(epoch from (v_ends_at - now())), 0);
    v_points := 100 + least(50, round(v_seconds_left));
  end if;

  insert into answers (round_id, player_id, choice, is_correct, points_awarded)
  values (p_round_id, p_player_id, p_choice, v_is_correct, v_points)
  on conflict (round_id, player_id) do nothing;

  if not found then
    raise exception 'You already answered this round';
  end if;

  return query select v_is_correct, v_points;
end;
$$;

grant execute on function submit_answer(uuid, uuid, text) to anon, authenticated;
