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

Para conectar Next.js a la instancia local, configura la URL y las claves de
esa misma instancia en `.env.local`, usando estos nombres:

`CEJTT_SUPABASE_URL`, `NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY` y
`CEJTT_SUPABASE_SERVICE_ROLE_KEY`.

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

`npm run test:e2e` carga `.env.test.local` y exige `E2E_TEST_ENV=1`, la URL y
clave pública del proyecto Supabase de pruebas y las seis credenciales descritas
en `.env.test.example`. El runner mapea `ADMIN2`/`ADMIN_PASS2` y
`COACH2`/`COACH_PASS2` a los nombres que usan las pruebas. Comprueba el destino
antes de ejecutarlo: este comando no cambia una URL remota por la instancia de
Docker. Las 11 pruebas que escriben en el backoffice se activan con
`E2E_BACKOFFICE_LOCAL=1`; ese indicador por sí solo no cambia el proyecto de
destino. El runner aborta antes de iniciar Playwright si la URL de Supabase no
es la local. No lo añadas a `.env.test.local` si la URL sigue siendo remota.

Para ejecutar las 21 pruebas contra Docker sin editar claves ni cuentas de prueba
en el archivo de entorno, usa:

```bash
npm run test:backoffice:local
```

Este script obtiene las claves de `supabase status`, crea cuentas y datos de
prueba en la instancia local, y pasa a Next y Playwright las variables locales
durante la ejecución. No hace falta definir `SUPABASE_DB_URL`: las pruebas SQL
usan la CLI de Supabase y el runner local de backoffice accede al contenedor
local. El script establece `E2E_BACKOFFICE_LOCAL=1` solo para ese proceso y
sustituye la URL y las claves por las de Docker.
