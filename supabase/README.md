# Supabase - Imperio Dorado

Esta carpeta prepara la fase Supabase sin necesitar todavia claves reales.

## Orden cuando tengas el proyecto
1. Crear proyecto Supabase en region Europa.
2. Abrir SQL Editor.
3. Ejecutar `schema.sql`.
4. Ejecutar `policies-safe.sql`.
5. Activar Auth por email.
6. Copiar `Project URL` y `anon public key` en `supabase-config.js`.
7. Crear una cuenta desde el juego.
8. Usar "Guardar nube" para sincronizar la partida inicial.

## Variables necesarias
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

La service role key solo se usa en backend o Edge Functions. No debe ir en `app.js`, Cloudflare Pages publicas ni en el navegador.

## Criterio de migracion
La primera fase guarda una copia completa de la partida en `player_saves` por usuario autenticado. Eso permite cuenta por correo y continuar desde otro dispositivo.

La fase final debera mover cada accion local a funciones autoritativas:
- validar recursos;
- descontar coste;
- crear cola o marcha;
- calcular finalizacion por reloj de servidor;
- generar informe;
- guardar evento en `server_events`.

## Primer endpoint logico
El primer candidato sera `city.queue.start`, porque construccion, investigacion, entrenamiento y curacion ya comparten un patron claro.
