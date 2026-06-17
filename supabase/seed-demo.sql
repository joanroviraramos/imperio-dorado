-- Imperio Dorado - seed demo para el usuario mas reciente
-- Ejecutar despues de schema.sql y policies-safe.sql.

with latest_user as (
  select id, email
  from auth.users
  order by created_at desc
  limit 1
),
profile_upsert as (
  insert into public.profiles (id, display_name)
  select id, coalesce(split_part(email, '@', 1), 'Capitan')
  from latest_user
  on conflict (id) do update
    set display_name = excluded.display_name,
        updated_at = now()
  returning id
),
alliance_upsert as (
  insert into public.alliances (kingdom_id, tag, name, honor, treasury, projects)
  values (
    'reino-1',
    'OD',
    'Orden del Dorado',
    0,
    '{"grain":6000,"wood":4200,"stone":3200,"iron":1800,"silver":760}'::jsonb,
    '{"relief":0,"routes":0,"banner":0}'::jsonb
  )
  on conflict (kingdom_id, tag) do update
    set name = excluded.name
  returning id
),
city_seed as (
  select
    profile_upsert.id as profile_id,
    alliance_upsert.id as alliance_id,
    80 + (abs(hashtext(profile_upsert.id::text)) % 350) as x,
    120 + (abs(hashtext(reverse(profile_upsert.id::text))) % 760) as y
  from profile_upsert
  cross join alliance_upsert
),
city_upsert as (
  insert into public.cities (
    profile_id,
    kingdom_id,
    alliance_id,
    name,
    power,
    x,
    y,
    resources,
    selected_hero_id,
    active_equipment_loadout
  )
  select
    profile_id,
    'reino-1',
    alliance_id,
    'Imperio Dorado',
    142800,
    x,
    y,
    '{"grain":12000,"wood":9400,"stone":8600,"iron":6100,"silver":3200,"gold":180}'::jsonb,
    'alonso',
    'attack'
  from city_seed
  on conflict (profile_id) do update
    set alliance_id = excluded.alliance_id,
        updated_at = now()
  returning id, profile_id, alliance_id, x, y
),
member_upsert as (
  insert into public.alliance_members (alliance_id, profile_id, rank, role)
  select alliance_id, profile_id, 'R5', 'Fundador'
  from city_upsert
  on conflict (alliance_id, profile_id) do update
    set rank = excluded.rank,
        role = excluded.role
  returning alliance_id, profile_id
),
home_marker_upsert as (
  insert into public.world_markers (id, kingdom_id, kind, name, level, x, y, owner_city_id, alliance_id, state)
  select
    'home-' || city_upsert.id::text,
    'reino-1',
    'home',
    'Imperio Dorado',
    8,
    city_upsert.x,
    city_upsert.y,
    city_upsert.id,
    city_upsert.alliance_id,
    '{"alliance":"OD"}'::jsonb
  from city_upsert
  on conflict (id) do update
    set x = excluded.x,
        y = excluded.y,
        owner_city_id = excluded.owner_city_id,
        alliance_id = excluded.alliance_id,
        updated_at = now()
  returning id
)
insert into public.server_events (profile_id, city_id, event_type, status, summary, detail)
select
  city_upsert.profile_id,
  city_upsert.id,
  'seed.demo',
  'accepted',
  'Ciudad demo creada',
  jsonb_build_object(
    'cityName', 'Imperio Dorado',
    'alliance', 'OD',
    'homeMarkerId', home_marker_upsert.id
  )
from city_upsert
cross join home_marker_upsert;

with city_target as (
  select cities.id
  from public.cities
  join public.profiles on profiles.id = cities.profile_id
  join auth.users on users.id = profiles.id
  order by users.created_at desc
  limit 1
),
building_seed (building_id, slot_id, kind, resource, level) as (
  values
    ('alcazar', null, 'government', null, 8),
    ('academia', null, 'research', null, 6),
    ('cuartel', null, 'barracks', null, 7),
    ('cuartel-sur', null, 'barracks', null, 5),
    ('hospital', null, 'hospital', null, 4),
    ('hospital-puerto', null, 'hospital', null, 3),
    ('almacen', null, 'storage', null, 6),
    ('forja', null, 'forge', null, 6),
    ('mercado', null, 'market', null, 7),
    ('casa-sabios', null, 'wisdom', null, 3),
    ('casa-alianza', null, 'alliance', null, 4),
    ('granja-1', 'resource-1', 'resource', 'grain', 5),
    ('granja-2', 'resource-2', 'resource', 'grain', 5),
    ('aserradero', 'resource-3', 'resource', 'wood', 10),
    ('cantera', 'resource-4', 'resource', 'stone', 4),
    ('mina-hierro', 'resource-5', 'resource', 'iron', 4)
)
insert into public.city_buildings (city_id, building_id, slot_id, kind, resource, level)
select city_target.id, building_seed.building_id, building_seed.slot_id, building_seed.kind, building_seed.resource, building_seed.level
from city_target
cross join building_seed
on conflict (city_id, building_id) do update
  set level = greatest(public.city_buildings.level, excluded.level),
      updated_at = now();

with city_target as (
  select cities.id
  from public.cities
  join public.profiles on profiles.id = cities.profile_id
  join auth.users on users.id = profiles.id
  order by users.created_at desc
  limit 1
),
research_seed (node_id, level) as (
  values
    ('troop-attack', 1),
    ('troop-defense', 1),
    ('troop-tier', 1),
    ('march-size', 1),
    ('march-speed', 1),
    ('monster-tier', 2)
)
insert into public.city_research (city_id, node_id, level)
select city_target.id, research_seed.node_id, research_seed.level
from city_target
cross join research_seed
on conflict (city_id, node_id) do update
  set level = greatest(public.city_research.level, excluded.level),
      updated_at = now();

with city_target as (
  select cities.id
  from public.cities
  join public.profiles on profiles.id = cities.profile_id
  join auth.users on users.id = profiles.id
  order by users.created_at desc
  limit 1
),
troop_seed (troop_id, available, wounded, reserved) as (
  values
    ('pikemen', 260, 70, 0),
    ('musketeers', 180, 40, 0),
    ('cavalry', 70, 16, 0),
    ('artillery', 16, 0, 0),
    ('galleons', 2, 0, 0)
)
insert into public.city_troops (city_id, troop_id, available, wounded, reserved)
select city_target.id, troop_seed.troop_id, troop_seed.available, troop_seed.wounded, troop_seed.reserved
from city_target
cross join troop_seed
on conflict (city_id, troop_id) do update
  set available = greatest(public.city_troops.available, excluded.available),
      wounded = greatest(public.city_troops.wounded, excluded.wounded),
      updated_at = now();

with city_target as (
  select cities.id
  from public.cities
  join public.profiles on profiles.id = cities.profile_id
  join auth.users on users.id = profiles.id
  order by users.created_at desc
  limit 1
),
hero_seed (hero_id, xp, energy, energy_max, is_selected) as (
  values
    ('alonso', 0, 100, 100, true),
    ('rodrigo', 0, 100, 100, false),
    ('hernan', 0, 100, 100, false),
    ('diego', 0, 100, 100, false)
)
insert into public.city_heroes (city_id, hero_id, xp, energy, energy_max, is_selected)
select city_target.id, hero_seed.hero_id, hero_seed.xp, hero_seed.energy, hero_seed.energy_max, hero_seed.is_selected
from city_target
cross join hero_seed
on conflict (city_id, hero_id) do update
  set energy_max = excluded.energy_max,
      is_selected = excluded.is_selected,
      updated_at = now();

with city_target as (
  select cities.id
  from public.cities
  join public.profiles on profiles.id = cities.profile_id
  join auth.users on users.id = profiles.id
  order by users.created_at desc
  limit 1
),
item_seed (item_id, quantity) as (
  values
    ('speed-build-15', 3),
    ('speed-research-30', 2),
    ('speed-training-30', 2),
    ('hero-energy-180', 1),
    ('frag-sword', 6),
    ('frag-map', 4),
    ('frag-shield', 3)
)
insert into public.city_inventory (city_id, item_id, quantity)
select city_target.id, item_seed.item_id, item_seed.quantity
from city_target
cross join item_seed
on conflict (city_id, item_id) do update
  set quantity = greatest(public.city_inventory.quantity, excluded.quantity),
      updated_at = now();
