# Upstash Redis

El proyecto usa Upstash Redis desde el servidor para limitar las solicitudes a
`POST /api/center-activity`.

## Configuración

Define uno de estos pares de variables. Se recomienda el nombre oficial de
Upstash; las variables `KV_*` se mantienen por compatibilidad.

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Alternativa compatible
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

No uses prefijos `NEXT_PUBLIC_`: la URL y el token solo deben estar disponibles
en rutas de servidor, componentes de servidor y tareas cron.

En Vercel, las cuatro variables están configuradas como secretos para
**Production**. Las nuevas variables se aplican en el siguiente despliegue; si
se habilitan para Preview o Development, usa credenciales y bases separadas.

## Rate limiting de inscripciones

Cada dirección IP se transforma en un hash SHA-256 y se utiliza como parte de
una clave Redis. No se guarda la IP en texto plano. El límite actual es de cinco
solicitudes por hora. Redis incrementa el contador de forma atómica y le asigna
un TTL de una hora con la primera solicitud.

Si Redis no está configurado o no está disponible, la petición falla en vez de
procesar una inscripción sin protección contra abuso.

## Caché de noticias

Desde la incorporación del editor de noticias, `getNews()` y la lectura del detalle
consultan Supabase sin caché compartida. Una noticia retirada deja de servirse aunque
Redis no esté disponible. La antigua clave `news:published:v1` ya no se consulta y
caduca por su TTL. Las demás funciones de Redis se mantienen.

## Operación

- Verifica que los cuatro nombres aparezcan como `Secret / Production` con
  `vercel env ls production`.
- Despliega de nuevo tras crear o modificar una variable de Production.
- Monitoriza errores de `[center-activity]` en los logs de Vercel.

## Pruebas

Las pruebas Jest de Redis no requieren una instancia ni credenciales reales:

```bash
npm run test:jest
```

- `tests/jest/rate-limit.test.ts` cubre el contador, el TTL inicial, el bloqueo
  al superar el límite y el fallo seguro sin configuración Redis.
- `tests/jest/news-store.test.ts` verifica lecturas públicas actualizadas, paginación
  y rechazo de la lectura cuando no puede comprobarse el estado de publicación.
