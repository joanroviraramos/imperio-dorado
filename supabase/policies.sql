-- Imperio Dorado - politicas RLS fase 1
-- Ejecutar despues de schema.sql.

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

drop policy if exists "kingdoms are readable" on public.kingdoms;
create policy "kingdoms are readable"
on public.kingdoms for select
using (true);

drop policy if exists "game balance is readable" on public.game_balance;
create policy "game balance is readable"
on public.game_balance for select
using (true);

drop policy if exists "profiles can read own row" on public.profiles;
create policy "profiles can read own row"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles can insert own row" on public.profiles;
create policy "profiles can insert own row"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles can update own row" on public.profiles;
create policy "profiles can update own row"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "alliances readable by authenticated" on public.alliances;
create policy "alliances readable by authenticated"
on public.alliances for select
to authenticated
using (true);

drop policy if exists "alliance members readable by authenticated" on public.alliance_members;
create policy "alliance members readable by authenticated"
on public.alliance_members for select
to authenticated
using (true);

drop policy if exists "cities owner readable" on public.cities;
create policy "cities owner readable"
on public.cities for select
to authenticated
using (profile_id = auth.uid());

drop policy if exists "city buildings owner readable" on public.city_buildings;
create policy "city buildings owner readable"
on public.city_buildings for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_buildings.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "city research owner readable" on public.city_research;
create policy "city research owner readable"
on public.city_research for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_research.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "city troops owner readable" on public.city_troops;
create policy "city troops owner readable"
on public.city_troops for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_troops.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "city heroes owner readable" on public.city_heroes;
create policy "city heroes owner readable"
on public.city_heroes for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_heroes.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "city inventory owner readable" on public.city_inventory;
create policy "city inventory owner readable"
on public.city_inventory for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_inventory.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "city equipment owner readable" on public.city_equipment;
create policy "city equipment owner readable"
on public.city_equipment for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_equipment.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "city queues owner readable" on public.city_queues;
create policy "city queues owner readable"
on public.city_queues for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = city_queues.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "world markers readable by authenticated" on public.world_markers;
create policy "world markers readable by authenticated"
on public.world_markers for select
to authenticated
using (true);

drop policy if exists "world marches owner readable" on public.world_marches;
create policy "world marches owner readable"
on public.world_marches for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = world_marches.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "reports owner readable" on public.reports;
create policy "reports owner readable"
on public.reports for select
to authenticated
using (
  exists (
    select 1 from public.cities
    where cities.id = reports.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "kingdom chat readable" on public.chat_messages;
create policy "kingdom chat readable"
on public.chat_messages for select
to authenticated
using (channel = 'kingdom');

drop policy if exists "alliance chat readable by members" on public.chat_messages;
create policy "alliance chat readable by members"
on public.chat_messages for select
to authenticated
using (
  channel = 'alliance'
  and exists (
    select 1 from public.alliance_members
    where alliance_members.alliance_id = chat_messages.alliance_id
      and alliance_members.profile_id = auth.uid()
  )
);

drop policy if exists "authenticated can send kingdom chat" on public.chat_messages;
create policy "authenticated can send kingdom chat"
on public.chat_messages for insert
to authenticated
with check (
  channel = 'kingdom'
  and author_profile_id = auth.uid()
);

drop policy if exists "members can send alliance chat" on public.chat_messages;
create policy "members can send alliance chat"
on public.chat_messages for insert
to authenticated
with check (
  channel = 'alliance'
  and author_profile_id = auth.uid()
  and exists (
    select 1 from public.alliance_members
    where alliance_members.alliance_id = chat_messages.alliance_id
      and alliance_members.profile_id = auth.uid()
  )
);

drop policy if exists "wisdom claims owner readable" on public.wisdom_claims;
create policy "wisdom claims owner readable"
on public.wisdom_claims for select
to authenticated
using (profile_id = auth.uid());

drop policy if exists "server events owner readable" on public.server_events;
create policy "server events owner readable"
on public.server_events for select
to authenticated
using (
  profile_id = auth.uid()
  or exists (
    select 1 from public.cities
    where cities.id = server_events.city_id
      and cities.profile_id = auth.uid()
  )
);

drop policy if exists "server events owner insertable" on public.server_events;
create policy "server events owner insertable"
on public.server_events for insert
to authenticated
with check (
  profile_id = auth.uid()
  or exists (
    select 1 from public.cities
    where cities.id = server_events.city_id
      and cities.profile_id = auth.uid()
  )
);
