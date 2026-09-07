# Plan de gestión de noticias en el backoffice

Fecha: 6 de septiembre de 2026.

## Objetivo

Permitir que la administración del club cree, revise, publique, retire y archive noticias desde el backoffice, conservando las noticias actuales y la integración con Medium.

Plan basado en la revisión del código local. No verifica el estado de producción ni implica haber implementado o probado las funcionalidades propuestas.

## Situación actual

- `news_articles` ya contiene título, resumen, fecha, tiempo de lectura, imagen, categorías, enlace externo, idioma y un indicador `published`. El enlace externo es obligatorio y único; no existe cuerpo de artículo.
- `lib/news-store.ts` sirve noticias publicadas y las guarda en Redis durante 300 segundos. La lectura pública está protegida mediante RLS; los usuarios autenticados no tienen actualmente permisos de escritura en esta tabla.
- `/news` y `/news/[slug]` muestran las noticias. El detalle presenta un resumen y enlaza al artículo completo, con una atribución fija a Medium. El slug se calcula a partir del título: editarlo puede cambiar la URL.
- Hay importación RSS en `lib/news-rss-sync.ts`, un endpoint cron y scripts de RSS, CSV y carga inicial. La sincronización RSS consulta solo noticias publicadas y hace upsert con `published: true`: una noticia retirada puede volver a publicarse y perder cambios editoriales.
- El backoffice dispone de navegación, controles de administrador, formularios con feedback, listados paginados e historial `backoffice_audit`, reutilizables para este módulo.

## Alcance propuesto para la primera versión

Solo administradores pueden gestionar noticias. Se admiten dos tipos: noticia externa con enlace a su fuente y artículo propio con contenido completo. Cada registro tiene un idioma explícito: catalán, castellano o inglés, sin traducción automática.

Flujo: **crear borrador → editar → previsualizar → publicar → retirar a borrador o archivar**. Restaurar una noticia archivada la devuelve a borrador. No se ofrece borrado definitivo en la primera versión.

La edición de una noticia publicada se aplica al guardar, con aviso claro. Preparar una revisión privada de un artículo ya publicado queda fuera de esta versión; no se promete que ese guardado sea un borrador independiente.

## Entregas

### 1. Modelo editorial y protección de importaciones — P0

- Mantener `news_articles` y sus identificadores existentes, que son de texto y pueden contener URLs.
- Incorporar `status` (`draft`, `published`, `archived`), `kind` (`external`, `internal`), `source` (`manual`, `rss`, `csv`, `legacy`), `slug` único y persistente, `body`, `image_alt`, `created_by`, `updated_by` y una versión para detectar ediciones concurrentes.
- Permitir `external_url` nulo para artículos propios. Exigir enlace válido para publicar noticias externas y contenido para publicar artículos propios. Mantener las categorías actuales.
- Mantener `date` como fecha editorial visible, independiente de las fechas de creación y modificación. Primera versión con publicación inmediata: la fecha no actúa como programador.
- Migrar el estado existente sin cambiar la visibilidad; calcular y revisar slugs con el algoritmo actual, detectar colisiones y conservar las URLs existentes. No atribuir autores ni procedencias que no puedan deducirse con fiabilidad.
- Durante la transición, mantener `published` sincronizado con `status` en base de datos, con una única regla de conversión. Cambiar su valor predeterminado a falso y actualizar todos los escritores antes de activar el módulo.
- Corregir RSS y scripts para buscar duplicados en todos los estados y usar inserciones idempotentes sin sobrescribir registros existentes. Usar ID y URL de origen como identidad; una coincidencia de título por sí sola no debe descartar artículos legítimos.
- Las nuevas entradas RSS se crean como borradores para revisión. Las noticias existentes conservan su estado. Registrar el origen de las operaciones automáticas sin inventar un usuario humano.

**Aceptación:** ejecutar dos veces la importación no duplica registros; una noticia retirada o archivada no se republica; una edición manual no se sobrescribe; los enlaces públicos existentes siguen funcionando.

### 2. Listado y editor en el backoffice — P1

- Añadir «Noticias» a la navegación administrativa y crear `/admin/news`, `/admin/news/new` y `/admin/news/[id]`.
- Codificar los identificadores de texto al construir rutas y comprobar su compatibilidad con IDs que contienen URLs; si el enrutamiento no los admite de forma fiable, usar un identificador administrativo UUID adicional, conservando el ID original.
- Listado con título, idioma, estado, origen, fecha editorial y última modificación. Búsqueda por título y filtros por estado, idioma, categoría y origen; páginas de 25 registros, orden estable y filtros en la URL.
- Formulario con título, resumen, tipo, idioma, categorías, fecha, imagen, texto alternativo y enlace externo o cuerpo según tipo. Editor Markdown limitado para artículos propios, sin HTML arbitrario y con enlaces validados.
- Mantener URL de imagen como opción inicial, con imagen de sustitución; la carga de archivos se aborda en la entrega 4.
- Botones explícitos para guardar borrador, guardar cambios publicados, previsualizar, publicar, retirar y archivar. Confirmar retirada y archivo indicando su efecto público.
- Mostrar errores por campo, resultado de guardado, aviso de cambios sin guardar y conflicto si otro administrador modificó el registro. No sobrescribir silenciosamente la versión ajena.
- Vista previa autenticada que reutiliza la presentación pública, sin incluir borradores en respuestas o cachés públicas.

**Aceptación:** un administrador completa el flujo desde el móvil sin acceder a Supabase; un error conserva el contenido introducido; volver del detalle mantiene los filtros; dos editores no pierden cambios sin aviso.

### 3. Permisos, publicación y web pública — P1

- Aplicar el control administrativo existente en cada lectura privada y mutación. Añadir permisos y políticas RLS: público solo publicado; administrador puede consultar todos los estados y realizar operaciones editoriales. Entrenadores y alumnos no pueden escribir ni acceder a borradores.
- Registrar creación, edición y cambios de estado en el historial del backoffice con autor y fecha. Revisar tamaño y campos del historial para evitar copiar cuerpos completos en cada cambio sin necesidad; el historial no equivale a un sistema de restauración de versiones.
- Actualizar el tipo `NewsArticle` y los consumidores para distinguir artículos propios y externos. Mostrar contenido completo en los propios y la fuente real en los externos.
- Resolver detalles por slug persistente, conservarlo cuando cambia el título y devolver 404 real para noticias inexistentes o no publicadas. Actualizar metadatos y añadir artículos publicados al sitemap.
- Invalidar Redis y las vistas públicas afectadas —portada, listado, detalle y sitemap— después de cada cambio. Cubrir también importaciones y cambios de estado.
- Evitar que una retirada dependa únicamente de borrar una clave Redis: definir una comprobación de visibilidad actual antes de servir contenido cacheado o una estrategia equivalente. Un fallo de invalidación no debe mantener públicamente una noticia retirada; informar por separado del guardado y de los fallos de actualización.

**Aceptación:** publicar muestra la noticia en la web; retirarla impide acceder al detalle y la excluye de API, portada, listado y sitemap, incluso con fallo de Redis; cambiar el título conserva su enlace; una petición directa no permite saltarse los permisos.

### 4. Imágenes y seguimiento de sincronización — P2

- Subida de portadas a Supabase Storage con permisos administrativos, límites de tamaño, validación del tipo real de archivo y formatos raster admitidos; nombres únicos y texto alternativo editable.
- Definir visibilidad de los archivos: las portadas de borradores deben permanecer privadas si se exige confidencialidad, usando acceso temporal autenticado para previsualizarlas. No asumir que proteger el artículo protege un archivo público.
- No borrar automáticamente imágenes compartidas al sustituirlas. La limpieza de archivos sin referencias será una operación posterior controlada.
- Pantalla o bloque de sincronización con última ejecución, resultado y recuentos de creadas, omitidas y errores. Guardar estos resultados, ya que no basta con los logs actuales.
- Acción administrativa «Sincronizar ahora» con exclusión de ejecuciones simultáneas y fuente configurada en servidor. No admitir URLs RSS arbitrarias desde el formulario.

**Aceptación:** un administrador puede subir una portada y conocer el resultado de la importación; un fallo conserva el contenido existente y permite reintentar sin duplicados.

## Secuencia y estimación orientativa

| Entrega | Dependencias | Esfuerzo |
| --- | --- | --- |
| 1. Modelo e importaciones | Ninguna | 2–3 días |
| 2. Listado y editor | 1 | 3–5 días |
| 3. Permisos y publicación pública | 1 y 2; permisos desde el inicio del desarrollo | 2–4 días |
| 4. Imágenes y seguimiento RSS | 1–3 | 2–3 días |

Primera versión utilizable: entregas 1–3, **7–12 días**. Alcance completo: **9–15 días** para una persona, incluyendo pruebas. Estimación inicial sujeta al volumen y calidad de datos, el editor y la estrategia de caché; no es un compromiso de calendario. Ninguna entrega intermedia se expone con permisos incompletos.

## Validación y despliegue

- Base local: migración con noticias existentes, colisiones de slug, restricciones de publicación, permisos por rol y trazabilidad.
- Pruebas de lógica: validación de enlaces y contenido, concurrencia, importación repetida, noticias archivadas y caché fallida durante retirada.
- Pruebas de navegador: crear → guardar → previsualizar → publicar → editar → retirar → archivar → restaurar; comprobar artículos externos e internos, búsqueda y paginación, móvil y teclado.
- Ejecutar TypeScript, lint, build y pruebas pertinentes al implementar. Este cambio documental no requiere ejecutarlas.
- Desplegar de forma coordinada: pausar importaciones durante la transición, disponer de copia recuperable, aplicar migración compatible, actualizar web y escritores, comprobar permisos y reanudar RSS. Las publicaciones existentes deben conservarse.
- Preparar reversión compatible con los nuevos tipos de artículo: no volver directamente a una aplicación que exige enlace externo si ya existen artículos propios. Conservar datos e historial y poder desactivar temporalmente el editor.

## Ampliaciones posteriores

Publicación programada, roles editor/revisor, revisiones privadas de noticias publicadas, recuperación de versiones, traducciones vinculadas, noticias destacadas, acciones masivas y distribución por correo o redes. No son dependencias para gestionar y publicar noticias en la primera versión.
