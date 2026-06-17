-- Imperio Dorado - Supabase fase 1
-- Ejecutar en el SQL editor de Supabase cuando el proyecto este creado.

create extension if not exists pgcrypto;

create table if not exists public.kingdoms (
  id text primary key,
  name text not null,
  region text not null default 'eu-central',
  max_x integer not null default 512,
  max_y integer not null default 1024,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alliances (
  id uuid primary key default gen_random_uuid(),
  kingdom_id text not null references public.kingdoms(id) on delete cascade,
  tag text not null,
  name text not null,
  honor bigint not null default 0,
  treasury jsonb not null default '{}'::jsonb,
  projects jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (kingdom_id, tag)
);

create table if not exists public.alliance_members (
  alliance_id uuid not null references public.alliances(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rank text not null default 'R1',
  role text not null default 'Miembro',
  joined_at timestamptz not null default now(),
  primary key (alliance_id, profile_id)
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  kingdom_id text not null references public.kingdoms(id) on delete cascade,
  alliance_id uuid references public.alliances(id) on delete set null,
  name text not null,
  power bigint not null default 0,
  x integer not null,
  y integer not null,
  resources jsonb not null default '{}'::jsonb,
  production_remainder jsonb not null default '{}'::jsonb,
  selected_hero_id text,
  active_equipment_loadout text not null default 'attack',
  last_tick_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kingdom_id, x, y)
);

create table if not exists public.city_buildings (
  city_id uuid not null references public.cities(id) on delete cascade,
  building_id text not null,
  slot_id text,
  kind text not null,
  resource text,
  level integer not null default 1 check (level between 1 and 25),
  updated_at timestamptz not null default now(),
  primary key (city_id, building_id)
);

create table if not exists public.city_research (
  city_id uuid not null references public.cities(id) on delete cascade,
  node_id text not null,
  level integer not null default 0 check (level >= 0),
  updated_at timestamptz not null default now(),
  primary key (city_id, node_id)
);

create table if not exists public.city_troops (
  city_id uuid not null references public.cities(id) on delete cascade,
  troop_id text not null,
  available integer not null default 0 check (available >= 0),
  wounded integer not null default 0 check (wounded >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now(),
  primary key (city_id, troop_id)
);

create table if not exists public.city_heroes (
  city_id uuid not null references public.cities(id) on delete cascade,
  hero_id text not null,
  xp bigint not null default 0,
  energy integer not null default 0,
  energy_max integer not null default 100,
  last_energy_at timestamptz not null default now(),
  is_selected boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (city_id, hero_id)
);

create table if not exists public.city_inventory (
  city_id uuid not null references public.cities(id) on delete cascade,
  item_id text not null,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (city_id, item_id)
);

create table if not exists public.city_equipment (
  city_id uuid not null references public.cities(id) on delete cascade,
  item_id text not null,
  level integer not null default 0 check (level between 0 and 5),
  quality text not null default 'common',
  updated_at timestamptz not null default now(),
  primary key (city_id, item_id)
);

create table if not exists public.city_queues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  queue_type text not null check (queue_type in ('construction', 'research', 'training', 'healing')),
  building_id text not null,
  label text not null,
  started_at timestamptz not null,
  finish_at timestamptz not null,
  help_applied integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.world_markers (
  id text primary key,
  kingdom_id text not null references public.kingdoms(id) on delete cascade,
  kind text not null check (kind in ('home', 'ally', 'enemy', 'resource', 'monster', 'capital')),
  name text not null,
  level integer not null default 1,
  x integer not null,
  y integer not null,
  owner_city_id uuid references public.cities(id) on delete set null,
  alliance_id uuid references public.alliances(id) on delete set null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (kingdom_id, x, y)
);

create table if not exists public.world_marches (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  marker_id text references public.world_markers(id) on delete set null,
  kind text not null,
  phase text not null check (phase in ('outbound', 'gathering', 'returning', 'resolved', 'cancelled')),
  with_hero boolean not null default false,
  hero_id text,
  troops jsonb not null default '{}'::jsonb,
  allied_troops jsonb not null default '{}'::jsonb,
  started_at timestamptz not null,
  arrive_at timestamptz not null,
  duration_ms integer not null default 0,
  return_duration_ms integer not null default 0,
  gather_duration_ms integer not null default 0,
  reward jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  marker_id text references public.world_markers(id) on delete set null,
  kind text not null,
  target_name text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  kingdom_id text not null references public.kingdoms(id) on delete cascade,
  alliance_id uuid references public.alliances(id) on delete cascade,
  channel text not null check (channel in ('kingdom', 'alliance')),
  author_profile_id uuid references public.profiles(id) on delete set null,
  text text not null check (char_length(text) <= 180),
  marker_id text references public.world_markers(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  coord jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.wisdom_claims (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_key text not null,
  pack_id text not null,
  difficulty text not null,
  reward jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (profile_id, week_key, pack_id)
);

create table if not exists public.server_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  city_id uuid references public.cities(id) on delete cascade,
  client_seq integer,
  event_type text not null,
  status text not null default 'accepted',
  summary text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.game_balance (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_cities_kingdom on public.cities(kingdom_id);
create index if not exists idx_markers_kingdom_kind on public.world_markers(kingdom_id, kind);
create index if not exists idx_marches_city_phase on public.world_marches(city_id, phase);
create index if not exists idx_queues_city_status on public.city_queues(city_id, status);
create index if not exists idx_reports_city_created on public.reports(city_id, created_at desc);
create index if not exists idx_chat_kingdom_created on public.chat_messages(kingdom_id, channel, created_at desc);
create index if not exists idx_events_city_created on public.server_events(city_id, created_at desc);

insert into public.kingdoms (id, name)
values ('reino-1', 'Reino 1')
on conflict (id) do nothing;
