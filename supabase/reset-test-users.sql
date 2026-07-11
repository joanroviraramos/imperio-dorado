-- Imperio Dorado - reset de cuentas de prueba
-- Ejecutar en Supabase SQL Editor solo cuando quieras borrar TODAS las cuentas Auth
-- y todas las partidas guardadas en nube de este proyecto.

begin;

do $$
begin
  if to_regclass('public.player_saves') is not null then
    execute 'delete from public.player_saves';
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'delete from public.profiles';
  end if;
end $$;

delete from auth.users;

commit;
