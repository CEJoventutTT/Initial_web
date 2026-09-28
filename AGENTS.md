<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Servicios externos y secretos

- Los valores locales están en `.env` y/o `.env.local`; consulta solo los nombres necesarios usando `parseEnv` de `node:util`. Nunca uses `source`, imprimas valores, los copies a archivos/salidas, los pases como argumentos ni los subas a Git. Informa solo si una variable está configurada.
- Prefiere consultas de solo lectura. Escrituras, borrados, migraciones, cambios de configuración/permisos, envíos de correo y despliegues requieren que estén expresamente incluidos en la tarea.
- **Supabase:** `CEJTT_SUPABASE_URL` y `NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY` (o sus alias definidos en `.env.example`) son para acceso con RLS. `CEJTT_SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SERVICE_ROLE_KEY` omite RLS: solo servidor y solo para tareas administrativas autorizadas.
- **Vercel:** toma proyecto y equipo de `.vercel/project.json`; el dominio de producción es `https://cejoventut.com`. Usa `VERCEL_TOKEN` desde `.env`/`.env.local` mediante entorno del proceso o cabecera de autorización, nunca como argumento. Antes de verificar producción, confirma despliegue, commit, intervalo de logs y navegación; no presupongas que el último despliegue sirve producción. Los logs pueden contener datos personales: resume lo necesario y redacta secretos.
- **Email:** la aplicación usa EmailJS por defecto (`EMAILJS_*`) o Resend si `EMAIL_PROVIDER=resend`, con fallback a EmailJS. `MJ_APIKEY_PUBLIC` y `MJ_APIKEY_PRIVATE` son credenciales de Mailjet, pero su presencia no significa que haya integración Mailjet en el código. No envíes correos reales salvo petición explícita.
- **Redis/Upstash:** `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o alias `KV_REST_API_URL`/`KV_REST_API_TOKEN`) son solo de servidor. No inspecciones ni modifiques claves hasta conocer sus efectos; no limpies ni resetees datos salvo petición explícita.
