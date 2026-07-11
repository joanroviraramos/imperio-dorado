-- Imperio Dorado - reset de cuentas de prueba
-- Ejecutar en Supabase SQL Editor solo cuando quieras borrar TODAS las cuentas Auth
-- y todas las partidas guardadas en nube de este proyecto.

begin;

delete from public.player_saves;
delete from public.profiles;
delete from auth.users;

commit;
