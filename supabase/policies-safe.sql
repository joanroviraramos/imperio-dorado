-- Imperio Dorado - politicas RLS sin operaciones destructivas
-- Ejecutar despues de schema.sql. Si una politica ya existe, se salta.

alter table public.kingdoms enable row level security;
alter table public.profiles enable row level security;
alter table public.alliances enable row level security;
alter table public.alliance_members enable row level security;
alter table public.cities enable row level security;
alter table public.city_buildings enable row level security;
alter table public.city_research enable row level security;
alter table public.city_troops enable row level security;
alter table public.city_heroes enable row level security;
alter table public.city_inventory enable row level security;
alter table public.city_equipment enable row level security;
alter table public.city_queues enable row level security;
alter table public.world_markers enable row level security;
alter table public.world_marches enable row level security;
alter table public.reports enable row level security;
alter table public.chat_messages enable row level security;
alter table public.wisdom_claims enable row level security;
alter table public.server_events enable row level security;
alter table public.game_balance enable row level security;

create or replace function pg_temp.create_policy_if_missing(
  target_table text,
  policy_name text,
  policy_sql text
) returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = target_table
      and policyname = policy_name
  ) then
    execute policy_sql;
  end if;
end;
$$;

select pg_temp.create_policy_if_missing(
  'kingdoms',
  'kingdoms are readable',
  $policy$create policy "kingdoms are readable" on public.kingdoms for select using (true)$policy$
);

select pg_temp.create_policy_if_missing(
  'game_balance',
  'game balance is readable',
  $policy$create policy "game balance is readable" on public.game_balance for select using (true)$policy$
);

select pg_temp.create_policy_if_missing(
  'profiles',
  'profiles can read own row',
  $policy$create policy "profiles can read own row" on public.profiles for select to authenticated using (id = auth.uid())$policy$
);

select pg_temp.create_policy_if_missing(
  'profiles',
  'profiles can insert own row',
  $policy$create policy "profiles can insert own row" on public.profiles for insert to authenticated with check (id = auth.uid())$policy$
);

select pg_temp.create_policy_if_missing(
  'profiles',
  'profiles can update own row',
  $policy$create policy "profiles can update own row" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid())$policy$
);

select pg_temp.create_policy_if_missing(
  'alliances',
  'alliances readable by authenticated',
  $policy$create policy "alliances readable by authenticated" on public.alliances for select to authenticated using (true)$policy$
);

select pg_temp.create_policy_if_missing(
  'alliance_members',
  'alliance members readable by authenticated',
  $policy$create policy "alliance members readable by authenticated" on public.alliance_members for select to authenticated using (true)$policy$
);

select pg_temp.create_policy_if_missing(
  'cities',
  'cities owner readable',
  $policy$create policy "cities owner readable" on public.cities for select to authenticated using (profile_id = auth.uid())$policy$
);

select pg_temp.create_policy_if_missing(
  'city_buildings',
  'city buildings owner readable',
  $policy$create policy "city buildings owner readable" on public.city_buildings for select to authenticated using (exists (select 1 from public.cities where cities.id = city_buildings.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'city_research',
  'city research owner readable',
  $policy$create policy "city research owner readable" on public.city_research for select to authenticated using (exists (select 1 from public.cities where cities.id = city_research.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'city_troops',
  'city troops owner readable',
  $policy$create policy "city troops owner readable" on public.city_troops for select to authenticated using (exists (select 1 from public.cities where cities.id = city_troops.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'city_heroes',
  'city heroes owner readable',
  $policy$create policy "city heroes owner readable" on public.city_heroes for select to authenticated using (exists (select 1 from public.cities where cities.id = city_heroes.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'city_inventory',
  'city inventory owner readable',
  $policy$create policy "city inventory owner readable" on public.city_inventory for select to authenticated using (exists (select 1 from public.cities where cities.id = city_inventory.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'city_equipment',
  'city equipment owner readable',
  $policy$create policy "city equipment owner readable" on public.city_equipment for select to authenticated using (exists (select 1 from public.cities where cities.id = city_equipment.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'city_queues',
  'city queues owner readable',
  $policy$create policy "city queues owner readable" on public.city_queues for select to authenticated using (exists (select 1 from public.cities where cities.id = city_queues.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'world_markers',
  'world markers readable by authenticated',
  $policy$create policy "world markers readable by authenticated" on public.world_markers for select to authenticated using (true)$policy$
);

select pg_temp.create_policy_if_missing(
  'world_marches',
  'world marches owner readable',
  $policy$create policy "world marches owner readable" on public.world_marches for select to authenticated using (exists (select 1 from public.cities where cities.id = world_marches.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'reports',
  'reports owner readable',
  $policy$create policy "reports owner readable" on public.reports for select to authenticated using (exists (select 1 from public.cities where cities.id = reports.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'chat_messages',
  'kingdom chat readable',
  $policy$create policy "kingdom chat readable" on public.chat_messages for select to authenticated using (channel = 'kingdom')$policy$
);

select pg_temp.create_policy_if_missing(
  'chat_messages',
  'alliance chat readable by members',
  $policy$create policy "alliance chat readable by members" on public.chat_messages for select to authenticated using (channel = 'alliance' and exists (select 1 from public.alliance_members where alliance_members.alliance_id = chat_messages.alliance_id and alliance_members.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'chat_messages',
  'authenticated can send kingdom chat',
  $policy$create policy "authenticated can send kingdom chat" on public.chat_messages for insert to authenticated with check (channel = 'kingdom' and author_profile_id = auth.uid())$policy$
);

select pg_temp.create_policy_if_missing(
  'chat_messages',
  'members can send alliance chat',
  $policy$create policy "members can send alliance chat" on public.chat_messages for insert to authenticated with check (channel = 'alliance' and author_profile_id = auth.uid() and exists (select 1 from public.alliance_members where alliance_members.alliance_id = chat_messages.alliance_id and alliance_members.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'wisdom_claims',
  'wisdom claims owner readable',
  $policy$create policy "wisdom claims owner readable" on public.wisdom_claims for select to authenticated using (profile_id = auth.uid())$policy$
);

select pg_temp.create_policy_if_missing(
  'server_events',
  'server events owner readable',
  $policy$create policy "server events owner readable" on public.server_events for select to authenticated using (profile_id = auth.uid() or exists (select 1 from public.cities where cities.id = server_events.city_id and cities.profile_id = auth.uid()))$policy$
);

select pg_temp.create_policy_if_missing(
  'server_events',
  'server events owner insertable',
  $policy$create policy "server events owner insertable" on public.server_events for insert to authenticated with check (profile_id = auth.uid() or exists (select 1 from public.cities where cities.id = server_events.city_id and cities.profile_id = auth.uid()))$policy$
);
