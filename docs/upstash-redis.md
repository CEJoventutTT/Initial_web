# Upstash Redis

El proyecto usa Upstash Redis exclusivamente desde el servidor para dos tareas:

- Limitar las solicitudes a `POST /api/center-activity`.
- Cachear las noticias públicas obtenidas desde Supabase.

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

`getNews()` busca primero `news:published:v1` en Redis. Si no existe, o si Redis
devuelve un error, consulta Supabase y continúa respondiendo normalmente. Las
lecturas correctas se guardan durante cinco minutos.

Una sincronización RSS que inserta noticias invalida la clave inmediatamente.
El TTL cubre cualquier actualización realizada fuera de esa sincronización.

## Operación

- Verifica que los cuatro nombres aparezcan como `Secret / Production` con
  `vercel env ls production`.
- Despliega de nuevo tras crear o modificar una variable de Production.
- Monitoriza errores con los prefijos `[news]` y `[center-activity]` en los logs
  de Vercel.

## Pruebas

Las pruebas Jest de Redis no requieren una instancia ni credenciales reales:

```bash
npm run test:jest
```

- `tests/jest/rate-limit.test.ts` cubre el contador, el TTL inicial, el bloqueo
  al superar el límite y el fallo seguro sin configuración Redis.
- `tests/jest/news-store.test.ts` cubre aciertos de caché, carga desde Supabase
  ante un miss y el fallback cuando Redis no está disponible.
