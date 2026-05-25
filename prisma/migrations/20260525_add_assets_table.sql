create table if not exists public.assets (
  id text primary key,
  user_id text not null,
  cdn_url text not null,
  prompt text not null,
  style text not null,
  type text not null,
  size integer not null,
  seed integer null,
  cost double precision not null default 0,
  duration double precision not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_assets_user_created_at
  on public.assets (user_id, created_at desc);
