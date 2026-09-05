# Backoffice: implementación y verificación

Fecha: 5 de septiembre de 2026.

Se han implementado las seis entregas del [plan de mejoras](plan-mejoras-backoffice.md) en el repositorio. La base local está migrada. La migración también se ha aplicado al proyecto remoto `nrxsinixiajdqaompffh`, compartido por `.env.test.local` y `.env.local`. La aplicación nueva todavía no se ha desplegado.

## Funcionalidad disponible

| Entrega | Resultado |
| --- | --- |
| 1. Correcciones operativas | Errores de carga con reintento; feedback por formulario; programas por nombre; validación de matrículas activas; horarios de Madrid con pruebas de cambio de hora; nuevas cuentas de tutor deshabilitadas. |
| 2. Navegación y listados | Inicio, Solicitudes, Personas, Programas, Correos, Sesiones y Asistencia. Búsqueda, filtros y páginas de 25 registros en servidor. Retorno del detalle conservando filtros. Búsqueda remota de personas y programas. `/admin/user` redirige a Personas. |
| 3. Circuito de altas | Aprobación, vinculación explícita o creación de cuenta y matrícula. Relación solicitud-persona, fecha de primera matrícula del circuito, invitaciones con intentos y exclusión de procesos simultáneos. Recuperación de cuentas parcialmente creadas sin duplicarlas. |
| 4. Personas y programas | Fichas, edición, baja/reactivación, consulta de matrículas, responsables y entrenadores adicionales. Archivo de programas con impacto previo y conservación del historial. Protección del último administrador. |
| 5. Sesiones y asistencia | Acceso destacado a hoy; filtros por fecha, periodo, programa y entrenador. Edición, duplicación con otra fecha, cancelación y eliminación solo de sesiones vacías. Lista de presentes/pendientes por sesión, paginada, con correcciones justificadas y recálculo de progreso. |
| 6. Seguimiento operativo | Pendientes actuales, solicitudes y altas por periodo, asistencia por programa, estados de correos y exportación completa de los listados filtrados de personas y solicitudes. |

Las altas completadas se cuentan por `membership_applications.completed_at`, establecido en la primera matrícula realizada desde la solicitud. El primer acceso a la cuenta se muestra separadamente mediante Auth. Los registros anteriores no reciben una fecha de finalización inventada.

Los cambios se registran en `backoffice_audit`. El historial de solicitudes conserva notas y estados anteriores; las matrículas y sesiones tienen enlaces a su historial. No se guardan contraseñas, enlaces de recuperación, claves QR ni tokens de sesión en el historial.

## Decisiones de funcionamiento

- Dar de baja a una persona desactiva sus matrículas. Para dar de baja a un entrenador hay que retirar o reasignar primero sus programas. El área del alumno muestra la situación de baja y la base rechaza nuevos entrenamientos de ese perfil.
- Reactivar una persona o programa no reactiva automáticamente matrículas ni sesiones anteriores.
- Archivar un programa desactiva matrículas activas y cancela sesiones futuras. La interfaz muestra el impacto antes de confirmar.
- Las sesiones con asistencia no pueden eliminarse ni trasladarse a otro programa. Pueden cancelarse conservando la asistencia.
- Retirar una asistencia requiere un motivo de 5–500 caracteres. Los XP se derivan de los registros existentes; se recalculan las misiones y se retira la insignia de primera asistencia si ya no quedan registros.
- Las horas ambiguas o inexistentes por cambio de hora se rechazan con una explicación, en vez de desplazarlas silenciosamente.
- La cuenta de una solicitud solo se vincula a una persona existente mediante selección explícita. La recuperación automática de una creación interrumpida requiere un identificador en `app_metadata`, que solo puede escribir el servidor administrativo.
- Los reintentos de invitación tienen exclusión temporal y un mínimo de un minuto. Los enlaces los gestiona Auth; no se almacenan ni se muestran en el backoffice. Se admite el retorno de Auth al formulario de contraseña aunque el cliente compartido utilice PKCE.
- «Enviada» significa que Auth ha aceptado el envío; no afirma recepción en la bandeja del destinatario. Los correos de formularios usan su cola existente, separada de las invitaciones de Auth.
- CSV exporta solo las columnas operativas del listado y protege las celdas frente a fórmulas. Los datos se obtienen por lotes; no se promete una instantánea transaccional si otra persona modifica registros durante la descarga.

## Verificación realizada

- TypeScript y ESLint sin errores.
- Compilación de producción correcta.
- 20 pruebas Jest y 8 pruebas Node correctas.
- 57 comprobaciones de base de datos correctas, incluidas 34 nuevas de backoffice.
- Lint de base local sin errores.
- Todas las migraciones y los datos de referencia se aplicaron en una base nueva aislada, utilizando una copia del esquema Auth sin datos. Esa base de comprobación se eliminó al terminar.
- 16 pruebas Playwright correctas contra Supabase local: permisos, formularios públicos, paginación de 61 solicitudes, búsqueda entre más de 500 personas, vínculo y matrícula sin duplicados, creación e invitación, establecimiento de contraseña, asistencia y corrección, horarios de sesiones, CSV y navegación móvil.
- Verificación con navegador de la carga del panel y su presentación en escritorio y móvil. Capturas de trabajo: `tmp/backoffice-desktop.png` y `tmp/backoffice-mobile.png`.

## Repetir las pruebas

Con Docker y Supabase local disponibles:

```bash
supabase start
supabase migration up --local
npm run test:db
npm run test:jest -- --runInBand
node --experimental-strip-types --test tests/*.test.ts
npm run test:backoffice:local
```

El comando local prepara personas y registros ficticios con prefijo `BO`, obtiene las claves de la instancia local sin imprimirlas y utiliza el puerto 3200 y `tmp/backoffice-next` como salida aislada. No cambia los archivos `.env` ni utiliza la base remota configurada en ellos. Los correos de Auth quedan en el buzón local de Mailpit. Si hace falta mantener el servidor abierto para revisar el panel:

```bash
node scripts/backoffice-local.mjs --serve
```

Las pruebas de backoffice que modifican registros solo se habilitan con este ejecutor local. La suite remota existente sigue disponible mediante `npm run test:e2e` y omite esos casos locales.

## Estado de la migración y despliegue pendiente

La migración siguiente ya está aplicada y registrada en `supabase_migrations.schema_migrations` en el proyecto remoto `nrxsinixiajdqaompffh`:

```text
supabase/migrations/20260905120000_backoffice_operations.sql
```

Se aplicó en una transacción, comprobando previamente las 12 migraciones anteriores y notificando a PostgREST para recargar el esquema. Después, `npm run test:e2e` terminó con 9 pruebas correctas, 0 fallidas y 7 omitidas por ser exclusivas del ejecutor local.

Para publicar la aplicación (o preparar otro proyecto):

1. Comprobar el proyecto de destino y disponer de copia recuperable de sus datos.
2. Aplicar la migración antes de publicar la aplicación; agrega columnas, tablas, funciones, permisos y protección del historial.
3. Desplegar la versión de la aplicación que utiliza esas funciones. Se mantienen las variables existentes de Supabase y su clave de servidor.
4. Verificar con una cuenta administrativa de prueba: listados, solicitud aprobada, matrícula y una sesión. Verificar la configuración SMTP y el retorno de Auth a `https://cejoventut.com/auth/update-password` antes de enviar invitaciones reales.

Si hay que volver a la aplicación anterior, conservar el esquema aditivo y el historial; no borrar las tablas nuevas para hacer rollback. La protección de sesiones con asistencia permanece activa.

Tutores y relaciones familiares, cuotas/pagos, recurrencias, acciones masivas y gestión editorial quedan como ampliaciones posteriores, tal como establece el plan.
