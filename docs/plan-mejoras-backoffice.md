# Plan de mejoras del backoffice

Fecha: 5 de septiembre de 2026.

## Objetivo y alcance

Facilitar el trabajo diario del club: tramitar solicitudes, gestionar personas y programas, organizar sesiones y controlar asistencia. Se incluyen administración y panel del entrenador. Plan basado en revisión del código local; no constituye una comprobación visual ni una verificación del estado de producción.

## Diagnóstico

La base operativa ya existe: revisión de solicitudes, invitaciones, creación de programas, asignación de entrenadores, matrículas y asistencia manual o por QR. Hay controles de rol, políticas de acceso a datos y pruebas existentes que deben conservarse.

Problemas observados:

- `app/admin/user/AdminClient.tsx` concentra las tareas en una sola pantalla de formularios. No ofrece un directorio de personas ni listados de matrículas y asignaciones para consultar y modificar su estado.
- `app/admin/user/page.tsx` limita la carga a 50 solicitudes, 500 perfiles y 100 programas, sin paginación. Convierte resultados sin datos en listas vacías sin presentar los errores de consulta.
- Aprobar una solicitud y crear una cuenta son acciones independientes. No se registra en estas acciones una relación entre solicitud y cuenta creada.
- `createUserAdmin` no revalida el listado tras crear una cuenta. El formulario permite seleccionar tutor aunque `docs/pr10.md` documenta que todavía no existe el modelo familiar.
- Los selectores de matrícula incluyen programas inactivos. La interfaz permite añadir asignaciones, pero no consultar ni retirar las existentes.
- `app/coach/sessions/page.tsx` exige introducir identificadores numéricos de programa. Varias acciones comunican errores únicamente en logs. Las fechas locales se interpretan en servidor sin explicitar la zona horaria del club.
- `app/coach/attendance/page.tsx` carga hasta 30 sesiones y consulta matrículas por cada sesión. No carga el estado de asistencia para mostrar quién está ya registrado.
- Las solicitudes guardan el último revisor y fecha; esto no equivale a un historial completo de cambios.

## Entregas priorizadas

### 1. Corregir fricciones y errores visibles — P0

Alcance:

- Diferenciar carga fallida, lista vacía y ausencia de resultados; ofrecer reintento.
- Actualizar los datos tras crear una cuenta y mostrar confirmación junto a la operación afectada.
- Bloquear envíos sin alumnos, entrenadores o programas válidos y excluir programas inactivos de nuevas matrículas.
- Sustituir los identificadores de programa por selectores con nombre en sesiones.
- Dar feedback de éxito y error en las acciones de sesiones y asistencia.
- Retirar temporalmente la creación de nuevos tutores de la interfaz hasta implementar sus relaciones y permisos, conservando los perfiles existentes.
- Definir y probar el tratamiento de horarios del club en Europe/Madrid, incluidos cambios de hora.

Criterios de aceptación: un fallo de base de datos nunca aparece como «no hay solicitudes»; una cuenta nueva está disponible para matricular sin recarga manual; no se necesita conocer un ID para crear una sesión; una hora introducida se muestra correctamente al volver a abrirla.

### 2. Navegación y listados operativos — P1

Alcance:

- Crear navegación por Inicio, Solicitudes, Personas, Programas y Sesiones/asistencia, con opciones según rol.
- Mantener compatible el acceso actual `/admin/user` mediante redirección cuando se separen las pantallas.
- Incorporar búsqueda, filtros, ordenación y paginación en servidor; conservar filtros en la URL.
- Sustituir selectores masivos de personas por búsqueda remota.
- Mostrar totales reales, fecha y antigüedad de solicitudes, y detalle bajo demanda.
- Usar una presentación consistente para tablas, formularios, estados y navegación móvil; verificar teclado y foco.

Criterios de aceptación: se puede encontrar una solicitud más allá de las primeras 50 y seleccionar personas fuera de las primeras 500; volver del detalle conserva la búsqueda y la página; los entrenadores solo ven sus programas autorizados.

### 3. Completar el circuito de altas — P1

Depende de las entregas 1 y 2.

Alcance:

- Ofrecer desde la solicitud el flujo «aprobar → vincular o invitar persona → matricular» con datos precargados.
- Guardar la relación entre solicitud y perfil. Distinguir aprobación administrativa de activación de cuenta y matrícula.
- Detectar cuentas existentes y pedir selección explícita antes de vincular; no fusionar personas automáticamente por coincidencia de correo.
- Registrar estado y último intento de invitación, ofrecer reenvío controlado y recuperación ante fallos parciales.
- Evitar duplicados ante doble clic o reintento; mostrar qué pasos se completaron y cuál debe reintentarse.
- Incorporar historial de cambios de estado y notas con autor y fecha.

Criterios de aceptación: una solicitud puede terminar vinculada a una persona matriculada sin copiar datos; repetir la operación no duplica cuentas ni matrículas; un fallo de correo deja el progreso visible y recuperable.

### 4. Gestión completa de personas y programas — P1

Depende de la entrega 2; coordinar el modelo con la entrega 3.

Alcance:

- Ficha de persona con datos básicos, programas, matrículas, invitación y asistencia.
- Editar datos y gestionar bajas o reactivaciones conservando historial.
- Consultar y modificar responsables y entrenadores adicionales; retirar asignaciones.
- Editar y archivar programas. Mostrar el impacto en matrículas y sesiones antes de confirmar.
- Gestionar bajas y reactivaciones de matrículas.
- Añadir confirmación y auditoría para cambios de rol; impedir dejar al sistema sin administrador.

Criterios de aceptación: el administrador puede saber quién pertenece a cada programa y quién lo imparte; una baja conserva la asistencia histórica; las restricciones se verifican también en servidor y base de datos.

### 5. Sesiones y asistencia para uso diario — P1

Depende de las entregas 1 y 2.

Alcance:

- Priorizar sesiones de hoy con filtros por fecha, programa y entrenador.
- Cargar alumnos y asistencia de la sesión seleccionada, evitando consultas repetidas por cada tarjeta.
- Mostrar presentes, pendientes y recuento; mantener la protección existente contra registros duplicados.
- Permitir correcciones con motivo y trazabilidad. Definir su efecto en XP, insignias y misiones antes de implementarlas.
- Preferir cancelación con historial para sesiones con asistencia; definir qué sesiones vacías se pueden eliminar.
- Añadir duplicación de sesión; dejar recurrencias para una ampliación posterior si aportan valor operativo.

Criterios de aceptación: el entrenador ve quién ha asistido sin volver a marcarlo; solo puede operar en programas autorizados; corregir asistencia deja el progreso coherente.

### 6. Resumen y seguimiento operativo — P2

Depende de tener estados y relaciones fiables en las entregas anteriores.

Alcance:

- Inicio con solicitudes pendientes, invitaciones pendientes, sesiones de hoy y programas sin responsable.
- Indicadores con periodo y definición explícitos: solicitudes recibidas, altas completadas y asistencia por programa.
- Vista administrativa de fallos de correo basada en los registros existentes. Comprobar qué envíos cubre la cola: las invitaciones Auth siguen un flujo distinto.
- Exportación de listados filtrados limitada a los datos necesarios para la tarea y al rol autorizado.

Criterios de aceptación: cada indicador lleva a su listado filtrado y coincide con sus totales; los fallos de correo se pueden identificar sin consultar logs ni exponer enlaces de recuperación.

## Secuencia y estimación orientativa

| Entrega | Esfuerzo estimado |
| --- | --- |
| 1. Correcciones operativas | 2–3 días |
| 2. Navegación y listados | 4–6 días |
| 3. Circuito de altas | 5–8 días |
| 4. Personas y programas | 5–8 días |
| 5. Sesiones y asistencia | 4–6 días |
| 6. Resumen y seguimiento | 3–5 días |

Estimación inicial: 23–36 días de desarrollo para una persona, incluyendo validación por entrega. No es un compromiso de calendario; ajustar después de cerrar el diseño funcional y revisar migraciones. Primera versión útil: entregas 1 y 2, aproximadamente 6–9 días.

## Verificación y despliegue por entrega

- Mantener los controles de autenticación, rol y acceso a filas existentes; añadir pruebas cuando se introduzcan nuevas operaciones o permisos.
- Probar los flujos afectados con administrador, entrenador y alumno en el entorno de pruebas separado descrito en `docs/pr10.md`.
- Añadir cobertura de altas completas, reintentos tras fallo, paginación y bajas con historial conforme se implementen.
- Revisar visualmente escritorio y móvil, teclado, estados vacíos y errores.
- Para cambios de esquema: validar migraciones sobre base local, compatibilidad con datos existentes y recuperación antes del despliegue.
- Ejecutar lint, build y pruebas pertinentes. Este documento no implica haber ejecutado esas comprobaciones.

## Decisiones para ampliaciones posteriores

- Tutores: definir vínculo con menores y alcance de visibilidad antes de activar nuevas cuentas de este tipo.
- Cuotas y pagos: confirmar si forman parte del trabajo del club que debe cubrir esta aplicación; no son una dependencia de este plan.
- Gestión editorial de noticias y galería: valorar como módulo separado después del circuito operativo.
- Recurrencia de sesiones, acciones masivas y automatizaciones de comunicación: añadir según volumen y necesidades observadas.
