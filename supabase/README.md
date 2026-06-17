# Supabase - Imperio Dorado

Esta carpeta prepara la fase Supabase sin necesitar todavia claves reales.

## Orden cuando tengas el proyecto
1. Crear proyecto Supabase en region Europa.
2. Abrir SQL Editor.
3. Ejecutar `schema.sql`.
4. Ejecutar `policies-safe.sql`.
5. Activar Auth por email.
6. Crear un usuario de prueba.
7. Ejecutar `seed-demo.sql` para crear una ciudad inicial al usuario mas reciente.

## Variables necesarias
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

La service role key solo se usa en backend o Edge Functions. No debe ir en `app.js`, Cloudflare Pages publicas ni en el navegador.

## Criterio de migracion
Mientras no haya backend, el juego sigue usando estado local. Cuando conectemos Supabase, cada accion local debe pasar por una funcion autoritativa:
- validar recursos;
- descontar coste;
- crear cola o marcha;
- calcular finalizacion por reloj de servidor;
- generar informe;
- guardar evento en `server_events`.

## Primer endpoint logico
El primer candidato sera `city.queue.start`, porque construccion, investigacion, entrenamiento y curacion ya comparten un patron claro.
