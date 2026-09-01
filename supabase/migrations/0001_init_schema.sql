-- 0001_init_schema.sql
-- Core tables for the pole vault trivia game

create extension if not exists "pgcrypto";

create table pools (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- short join code, e.g. "VAULT7"
  name text not null default 'Pole Vault Trivia',
  status text not null default 'waiting'
    check (status in ('waiting', 'active', 'finished')),
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  unique (pool_id, display_name)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  choices jsonb not null,                     -- e.g. ["A","B","C","D"]
  correct_choice text not null,                -- never exposed to clients directly
  category text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  image_url text,
  created_at timestamptz not null default now()
);

create table rounds (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id) on delete cascade,
  question_id uuid not null references questions(id),
  round_number int not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  unique (pool_id, round_number)
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  choice text not null,
  is_correct boolean not null,
  points_awarded int not null default 0,
  answered_at timestamptz not null default now(),
  unique (round_id, player_id)                 -- one answer per player per round
);

create index idx_players_pool on players(pool_id);
create index idx_rounds_pool on rounds(pool_id);
create index idx_answers_round on answers(round_id);
create index idx_answers_player on answers(player_id);
