# Noticias: implementación y despliegue

Fecha: 6 de septiembre de 2026.

Las cuatro entregas del [plan editorial](plan-gestion-noticias.md) están implementadas en el repositorio. Las migraciones están aplicadas a Supabase local y, desde el 7 de septiembre de 2026, al proyecto de producción `nrxsinixiajdqaompffh`. La aplicación nueva todavía no se ha desplegado.

## Uso

1. Entrar como administrador activo y abrir **Noticias** en `/admin/news`.
2. Crear una noticia externa con enlace o un artículo propio. Elegir idioma, categorías y fecha editorial en horario de Madrid.
3. Guardar el borrador y abrir **Vista previa guardada**. La vista previa requiere autenticación administrativa y muestra el último contenido guardado.
4. Publicar. Los artículos propios muestran el contenido completo; los externos identifican el dominio de origen y ofrecen el enlace.
5. Guardar una noticia publicada actualiza inmediatamente el contenido público. **Retirar a borrador** y **Archivar** dejan de servirla. Una noticia archivada debe restaurarse a borrador antes de publicarla de nuevo.

Los cambios simultáneos se detectan mediante una versión comprobada bajo bloqueo de fila. Ante un conflicto, se conserva el texto del formulario y se ofrece abrir la versión actual en otra pestaña. El historial muestra autor, fecha y campos modificados; el cuerpo se registra mediante una huella, sin duplicar todo el texto. No permite restaurar versiones antiguas.

El editor admite párrafos, subtítulos `##`, negrita `**texto**`, listas `-` y enlaces `[texto](https://...)`. No ejecuta HTML ni admite imágenes embebidas en el cuerpo. Cada noticia tiene un idioma; no se generan traducciones.

## Portadas

Se admiten URLs HTTP/HTTPS, rutas locales o subida de JPEG, PNG y WebP de hasta **4 MB**. El servidor limita también los bytes de peticiones sin `Content-Length`, comprueba el formato real, limita la resolución de entrada y convierte a WebP con un máximo de 1920 × 1920 píxeles.

Los archivos se guardan con nombre UUID en el bucket privado `news-images`. `/api/news/images/[id]` aplica las políticas de lectura: administradores o imágenes asociadas a noticias publicadas. Las respuestas de imagen no usan caché pública. Un archivo subido sin guardar la noticia queda privado; no se eliminan automáticamente archivos sin referencias ni imágenes compartidas.

Una URL externa depende de los permisos y disponibilidad de su servidor de origen. La privacidad del bucket se aplica a los archivos subidos al club.

## Datos, enlaces y lectura pública

- `news_articles` conserva su ID de texto y recibe `admin_id` UUID para las rutas administrativas, además de estado, tipo, origen, cuerpo, descripción de imagen, autor y versión.
- Los slugs existentes se migran con el algoritmo anterior. Una colisión detiene la migración antes de cambiar enlaces silenciosamente. El slug permanece estable al editar el título.
- El estado editorial determina el booleano `published` existente. La escritura administrativa utiliza `admin_save_news`; no se conceden escrituras directas a usuarios autenticados.
- El público solo puede consultar noticias publicadas mediante RLS. La API de listado no entrega el cuerpo completo. Los artículos inexistentes o retirados devuelven 404 y se excluyen del sitemap.
- Se ha retirado la caché Redis de noticias. Listado, detalle y sitemap consultan el estado actual en Supabase sin caché compartida; si falla la base, no se devuelve una copia antigua. Redis sigue utilizándose para las inscripciones.

## RSS y scripts

El cron, la acción **Sincronizar ahora desde Medium** y el script `news:sync-rss` comparten `scripts/news-rss-runner.mjs`. El backoffice utiliza la fuente fija del club, sin permitir introducir URLs arbitrarias.

`import_news` inserta únicamente registros nuevos, con estado borrador. Los conflictos de ID o enlace se omiten de forma atómica; nunca se sobrescriben cambios manuales ni se republican noticias retiradas. Un título coincidente no se considera suficiente para descartar otra noticia.

`news_sync_runs` registra ejecuciones, resultado y recuentos. Solo puede haber una ejecución RSS activa; una ejecución interrumpida puede recuperarse al caducar a los diez minutos. La lectura del feed tiene un tiempo límite de 30 segundos. El panel muestra las cinco ejecuciones más recientes; las anteriores se conservan en la base.

La importación CSV sigue generando el archivo local, y `news:seed-supabase` inserta sus entradas nuevas como borradores. Estos scripts requieren la nueva migración y ya no funcionan como un mecanismo de republicación o actualización de noticias existentes.

## Verificación

- TypeScript, ESLint y compilación de producción con Supabase local.
- 26 pruebas Jest: lectura pública actualizada, error de base, paginación, enlaces, validaciones y suites existentes.
- 10 pruebas Node, incluidas normalización RSS, conflictos por origen y registro de fallos de sincronización.
- 87 comprobaciones de base de datos, incluidas 30 del módulo editorial: roles, publicación, versiones, auditoría, importaciones repetidas y exclusión de sincronizaciones simultáneas.
- 11 pruebas Playwright locales: las siete existentes del backoffice y cuatro de noticias. Cubren el ciclo editorial completo, artículos internos y externos, vista previa, privacidad de portadas, retirada pública, enlaces estables, historial, conflictos, filtros y móvil.
- Comparación de los slugs de las 20 noticias de `data/news.json` con la función de migración: sin cambios.
- Ejecución del importador compartido con una entrada RSS de prueba local: una creación en la primera ejecución y cero en la segunda.

Repetir en local:

```bash
supabase start
supabase migration up --local
supabase test db
npm run test:jest -- --runInBand
node --experimental-strip-types --test tests/*.test.ts
node scripts/backoffice-local.mjs news.spec.ts backoffice.spec.ts
```

La suite de noticias que escribe datos se omite fuera del ejecutor local. Utiliza noticias con prefijo `BO`, sin enviar comunicaciones reales. Para revisión manual: `node scripts/backoffice-local.mjs --serve`, en el puerto 3200.

## Migraciones aplicadas en producción

El 7 de septiembre de 2026 se aplicaron `20260906120000_news_editorial` y `20260906130000_news_editorial_validation` en una transacción, con bloqueo de la tabla de noticias y registro en `supabase_migrations.schema_migrations`. No quedan migraciones locales pendientes en ese proyecto.

Antes de aplicar los cambios se guardó una copia restringida de las noticias y del registro de migraciones en `tmp/news-production-backup-20260907/`. El archivo `news-before.dump` es un archivo de pg_dump comprobado con pg_restore; `news-before.json` conserva los registros originales. Esta copia cubre las tablas afectadas, no sustituye una copia completa del proyecto.

Se comprobó dentro de la transacción que el contenido previo se conservaba, salvo la actualización automática de `updated_at`. Las 27 noticias continúan publicadas y mantienen sus URLs. El bucket `news-images` es privado.

Como protección durante la transición se revocaron adicionalmente los permisos directos `INSERT` y `UPDATE` de `service_role` sobre `news_articles`. El importador antiguo que utilice upsert directo quedará bloqueado si intenta escribir. El nuevo importador mediante `import_news` conserva su permiso de ejecución y no necesita esos permisos directos. No se ha desactivado el resto de tareas cron. Una vez desplegada la aplicación nueva, debe comprobarse el resultado de RSS en el panel; no es necesario restituir las escrituras directas para ese flujo.

## Despliegue de aplicación pendiente

1. Verificar el proyecto de destino y disponer de copia recuperable. Pausar temporalmente el cron y los scripts antiguos de noticias.
2. Revisar posibles colisiones de slugs y datos antiguos que excedan los límites del editor; no renombrar URLs públicas automáticamente.
3. En otro proyecto, aplicar en orden (ya completado en producción):
   - `supabase/migrations/20260906120000_news_editorial.sql`
   - `supabase/migrations/20260906130000_news_editorial_validation.sql`
4. Desplegar la aplicación y actualizar los scripts operativos. Se reutilizan las variables actuales de Supabase y `CRON_SECRET`; la migración crea el bucket y sus políticas.
5. Comprobar una noticia existente, un borrador privado y el flujo publicar → retirar, incluida su portada. Reanudar la sincronización y comprobar su resultado en el panel.

No revertir a una aplicación que exija enlace externo después de crear artículos propios. Conservar el esquema y el historial; para contener un problema, desactivar las escrituras editoriales y corregir la aplicación compatible.

Publicación programada, revisiones privadas de artículos publicados, traducciones vinculadas y recuperación de versiones permanecen fuera del alcance de esta entrega.
