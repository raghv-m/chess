-- ═══════════════════════════════════════════════════════════════════════════
-- 3D Chess — online multiplayer schema
--
-- Run this ONCE in the SQL editor of the dedicated "chess" Supabase project
-- (see SETUP.md). It creates the two tables the game service uses, locks
-- them down with Row Level Security, and registers `games` with Realtime
-- so clients get the "something changed" doorbell.
--
-- Security model:
--   * ALL writes happen in Next.js route handlers using the service-role
--     key, after the seat token has been checked and the move validated
--     by the server-side ChessEngine. The service role bypasses RLS.
--   * The anon key (what browsers hold) may only SELECT. That powers
--     Realtime subscriptions and nothing else — there are deliberately
--     no INSERT/UPDATE/DELETE policies for anon or authenticated roles.
--   * `games` rows contain SHA-256 hashes of the seat tokens (never the
--     tokens themselves). Tokens are 256-bit random values, so a leaked
--     hash is not brute-forceable; the hashes exist so the API can
--     recognise a returning player's seat.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.games (
  code             text primary key,
  status           text not null default 'waiting'
                     check (status in ('waiting', 'active', 'finished')),
  -- EngineSnapshot JSON produced by ChessEngine.toSnapshot()
  snapshot         jsonb not null,
  white_token_hash text,
  black_token_hash text,
  draw_offer_by    text check (draw_offer_by in ('white', 'black')),
  winner           text check (winner in ('white', 'black', 'draw')),
  end_reason       text,  -- checkmate | stalemate | insufficient_material
                          -- | resignation | draw_agreement | abandoned
  rematch_code     text references public.games (code),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.moves (
  code      text not null references public.games (code) on delete cascade,
  ply       int  not null,             -- 1-based move number within the game
  from_sq   jsonb not null,            -- Position { x, y, layer }
  to_sq     jsonb not null,            -- Position { x, y, layer }
  promotion text,                      -- queen | rook | bishop | knight | null
  created_at timestamptz not null default now(),
  primary key (code, ply)
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table public.games enable row level security;
alter table public.moves enable row level security;

-- Read-only for the public (anon) role — required for Realtime
-- postgres_changes to deliver row updates to subscribed browsers.
-- No write policies are created on purpose: anon/authenticated roles
-- cannot insert, update, or delete. The service role bypasses RLS and
-- performs every write from the server after validation.

drop policy if exists "games are readable by anyone" on public.games;
create policy "games are readable by anyone"
  on public.games for select
  using (true);

drop policy if exists "moves are readable by anyone" on public.moves;
create policy "moves are readable by anyone"
  on public.moves for select
  using (true);

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- The games table must be in the supabase_realtime publication for the
-- UPDATE doorbell to fire. Guarded so re-running this file is safe.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'games'
  ) then
    alter publication supabase_realtime add table public.games;
  end if;
end $$;
