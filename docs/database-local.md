# Base de datos local

El esquema de Supabase se mantiene en `supabase/migrations/`. La migración
`20260729190000_reconstruct_club_schema.sql` reconstruye las entidades que usa
la aplicación sin copiar usuarios ni datos personales del proyecto remoto.

## Arranque limpio

Requiere Docker Desktop y Supabase CLI:

```bash
supabase start
supabase db reset
```

`db reset` recrea la base, aplica todas las migraciones en orden y carga
`supabase/seed.sql`.

Para conectar Next.js a la instancia local, copia de `supabase status` la URL y
la anon key a `.env.local`, usando:

```text
CEJTT_SUPABASE_URL=...
NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY=...
CEJTT_SUPABASE_SERVICE_ROLE_KEY=...
```

No deben copiarse usuarios de `auth.users` desde producción. Las cuentas de
prueba se crean localmente desde Supabase Studio o mediante la API de Auth.
Después se debe crear su fila correspondiente en `public.profiles` mediante un
flujo administrativo; los roles nunca se derivan de metadatos enviados durante
un registro público.

## Comprobar diferencias con el remoto

El remoto inspeccionado inicialmente solo contenía `public.news_articles`. Las
migraciones se publicaron después de validar autorización, RLS y un `dry-run`.
Para futuras modificaciones, revisar siempre:

```bash
supabase db diff
supabase db push --dry-run
```

No se debe ejecutar `db push` si el `dry-run` contiene migraciones inesperadas.
Las operaciones de sesiones y QR ya no usan `service_role`; los privilegios
administrativos se reservan para la creación autenticada de usuarios.

## Pruebas end-to-end

Las pruebas E2E solo cargan `.env.test.local`; no leen `.env` ni `.env.local`.
Copia `.env.test.example` a `.env.test.local` y rellénalo con un proyecto
Supabase y cuentas dedicadas a pruebas. En CI las seis credenciales de rol son
obligatorias y la ejecución falla si falta alguna.
