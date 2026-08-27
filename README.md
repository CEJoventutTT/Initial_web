# CE Joventut TT

Web del Club Esportiu Joventut TT, construida con Next.js, TypeScript y Supabase.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Para usar la base local, consulta [`docs/database-local.md`](docs/database-local.md)
y ejecuta `supabase start` y `supabase db reset`. No uses credenciales de producción
para las pruebas.

## Comprobaciones

```bash
npm run lint
npx tsc --noEmit
npm run build
node --experimental-strip-types --test tests/*.test.ts
npm run test:e2e
```

Las pruebas E2E requieren un `.env.test.local` con un proyecto y cuentas dedicadas;
las variables necesarias están documentadas en [`.env.test.example`](.env.test.example).

## Variables principales

- Supabase: `CEJTT_SUPABASE_URL`, `NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY` y
  `CEJTT_SUPABASE_SERVICE_ROLE_KEY` (solo servidor).
- Cron: `CRON_SECRET`.
- Inscripciones: `RESEND_API_KEY`, `BRAND_FROM_EMAIL` y `REQUESTS_INBOX_EMAIL`.

Nunca commits `.env`, claves de Supabase ni credenciales de pruebas.

## Mejoras recientes

La inscripción se procesa mediante `/api/center-activity`, en servidor, usando
Resend. El navegador ya no envía solicitudes directamente a EmailJS. El endpoint
valida el contenido, limita peticiones por IP, rechaza cuerpos grandes y escapa
los datos antes de insertarlos en HTML de correo.

El dashboard usa tipos explícitos para progreso y pasos de misiones. Las pruebas
E2E cubren también la navegación pública a noticias e inscripción. Consulta el
detalle completo en [`docs/pr05.md`](docs/pr05.md).
