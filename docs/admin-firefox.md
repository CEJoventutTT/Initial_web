# Carga inicial de administración en Firefox

Corregido el 7 de septiembre de 2026 actualizando Next.js de 16.2.12 a
16.3.4 y alineando `eslint-config-next` con esa versión.

El canal de depuración de Next.js interpretaba `transferSize === 0` como
una restauración desde caché. Firefox también devuelve ese valor mientras
recibe una respuesta en streaming, provocando recargas continuas de `/admin`.
El panel permanecía mostrando «Cargando datos del club…» aunque el servidor
respondiera correctamente.

Referencias del proyecto Next.js:
- [Incidencia #95164](https://github.com/vercel/next.js/issues/95164).
- [Corrección #94128](https://github.com/vercel/next.js/pull/94128).

La regresión `tests/e2e/admin-loading.spec.ts` inicia sesión y abre `/admin`
en una pestaña nueva; comprueba que aparece el resumen con una sola petición
de documento y repite la comprobación al recargar. Solo consulta datos.

Contra un servidor de desarrollo ya iniciado:

```sh
E2E_BASE_URL=http://localhost:3000 node scripts/test-e2e.mjs --config playwright.firefox.config.ts
E2E_BASE_URL=http://localhost:3000 node scripts/test-e2e.mjs admin-loading.spec.ts
```

Requiere las credenciales de pruebas de `.env.test.local` y los navegadores
de Playwright instalados. Firefox fallaba antes de actualizar por recargas
repetidas; después pasan Firefox y Chromium. También pasan la compilación
de producción, ESLint, TypeScript y las 26 pruebas Jest.
