import Link from 'next/link'
import { checked, requireOperator } from '@/lib/backoffice/server'
import { clubDateRange, clubDayBounds, clubToday } from '@/lib/backoffice/time'
import { listParams, param, type SearchParams } from '@/lib/backoffice/list'
import {
  Empty,
  Field,
  PageHeading,
  Pagination,
} from '@/components/backoffice/list'

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const today = clubToday(),
    fromDay = param(params, 'from', `${today.slice(0, 7)}-01`),
    toDay = param(params, 'to', today)
  const range = clubDateRange(fromDay, toDay),
    day = clubDayBounds(today)
  const { supabase } = await requireOperator()
  const [applications, invitations, sessions, unassigned] = await Promise.all([
    supabase
      .from('membership_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabase
      .rpc('admin_invitation_status', {}, { count: 'exact', head: true })
      .is('last_sign_in_at', null),
    supabase
      .from('attendance_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .gte('start_at', day.from)
      .lt('start_at', day.to),
    supabase
      .from('programs')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .is('coach_id', null),
  ])
  const cards = [
    [
      'Solicitudes nuevas',
      checked(applications).count,
      '/admin/applications?status=new',
    ],
    [
      'Accesos pendientes',
      checked(invitations).count,
      '/admin/emails?pending_access=true',
    ],
    [
      'Sesiones activas de hoy',
      checked(sessions).count,
      `/coach/sessions?date=${today}&state=active`,
    ],
    [
      'Programas sin responsable',
      checked(unassigned).count,
      '/admin/programs?active=true&unassigned=true',
    ],
  ] as const
  const paging = listParams(params)
  const results = range
    ? await Promise.all([
        supabase
          .from('membership_applications')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', range.from)
          .lt('created_at', range.to),
        supabase
          .from('membership_applications')
          .select('id', { count: 'exact', head: true })
          .gte('completed_at', range.from)
          .lt('completed_at', range.to),
        supabase
          .rpc(
            'admin_attendance_summary',
            { p_from: range.from, p_to: range.to },
            { count: 'exact' },
          )
          .order('program_name')
          .order('program_id')
          .range(paging.from, paging.to),
      ])
    : null
  results?.forEach(checked)
  return (
    <div className="space-y-6">
      <PageHeading
        title="Resumen del club"
        description="Pendientes actuales y actividad del periodo seleccionado."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, count, href]) => (
          <Link
            key={title}
            href={href}
            className="bo-panel block transition hover:bg-white/10"
          >
            <p className="text-sm text-white/65">{title}</p>
            <p className="my-2 text-4xl font-bold">{count ?? 0}</p>
            <span className="bo-link text-sm">Ver listado →</span>
          </Link>
        ))}
      </div>
      <form className="bo-panel flex flex-wrap items-end gap-4" action="/admin">
        <Field name="from" label="Desde">
          <input
            className="bo-input"
            type="date"
            id="from"
            name="from"
            defaultValue={fromDay}
            required
          />
        </Field>
        <Field name="to" label="Hasta">
          <input
            className="bo-input"
            type="date"
            id="to"
            name="to"
            defaultValue={toDay}
            required
          />
        </Field>
        <button className="bo-button">Aplicar periodo</button>
      </form>
      {!range ? (
        <p role="alert" className="bo-panel">
          Introduce un intervalo de fechas válido.
        </p>
      ) : (
        results && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                className="bo-panel"
                href={`/admin/applications?from=${fromDay}&to=${toDay}`}
              >
                <p>Solicitudes recibidas</p>
                <p className="my-2 text-3xl font-bold">
                  {results[0].count ?? 0}
                </p>
                <span className="bo-link text-sm">
                  Ver solicitudes del periodo
                </span>
              </Link>
              <Link
                className="bo-panel"
                href={`/admin/applications?from=${fromDay}&to=${toDay}&completed=true`}
              >
                <p>Altas completadas</p>
                <p className="my-2 text-3xl font-bold">
                  {results[1].count ?? 0}
                </p>
                <span className="bo-link text-sm">Ver altas del periodo</span>
              </Link>
            </div>
            <p className="text-sm text-white/55">
              Alta completada: solicitud aprobada y vinculada que terminó su
              primera matrícula desde este circuito. No equivale a primer
              acceso. Los registros anteriores no se contabilizan
              retroactivamente.
            </p>
            <section className="bo-panel">
              <h3 className="mb-4 text-lg font-semibold">
                Asistencias por programa
              </h3>
              <p className="mb-4 text-sm text-white/60">
                Marcas de asistencia en sesiones que comienzan dentro del
                periodo, con horario de Madrid. Una persona puede contar en
                varias sesiones.
              </p>
              {results[2].data?.length ? (
                <ul className="space-y-3">
                  {(
                    results[2].data as {
                      program_id: number
                      program_name: string
                      attendance_count: number
                    }[]
                  ).map((row) => (
                    <li
                      key={row.program_id}
                      className="flex justify-between gap-4 border-b border-white/10 pb-3"
                    >
                      <Link
                        className="bo-link"
                        href={`/coach/sessions?program_id=${row.program_id}&from=${fromDay}&to=${toDay}`}
                      >
                        {row.program_name}
                      </Link>
                      <strong>{row.attendance_count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No hay asistencias en este periodo.</Empty>
              )}
              <Pagination
                path="/admin"
                params={{ ...params, from: fromDay, to: toDay }}
                count={results[2].count ?? 0}
                page={paging.page}
              />
            </section>
          </>
        )
      )}
    </div>
  )
}
