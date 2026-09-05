import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { login } from './helpers'

// Mutations are deliberately restricted to the local runner and disposable fixture IDs.
test.skip(
  process.env.E2E_BACKOFFICE_LOCAL !== '1',
  'Run with scripts/backoffice-local.mjs against local Supabase',
)
function sql(query: string) {
  if (process.env.NEXT_PUBLIC_CEJTT_SUPABASE_URL !== 'http://127.0.0.1:54321')
    throw new Error('Local database required')
  return execFileSync(
    'docker',
    [
      'exec',
      '-i',
      'supabase_db_Initial_web',
      'psql',
      '-U',
      'postgres',
      '-At',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    { input: query, encoding: 'utf8' },
  ).trim()
}

test('administrator can paginate, search beyond old limits and preserve the return filters', async ({
  page,
}) => {
  await login(page, 'admin', '/admin')
  await expect(
    page.getByRole('heading', { name: 'Resumen del club' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Solicitudes', exact: true }).click()
  await page.getByLabel('Buscar', { exact: true }).fill('BO Solicitud')
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click()
  await expect(page.getByText('61 registros · Página 1 de 3')).toBeVisible()
  await page.getByRole('link', { name: 'Siguiente' }).click()
  await expect(page.getByText('61 registros · Página 2 de 3')).toBeVisible()
  await page.getByRole('link', { name: 'Siguiente' }).click()
  await expect(page.getByText('61 registros · Página 3 de 3')).toBeVisible()
  await page.locator('tbody a').first().click()
  await page.getByRole('link', { name: '← Volver a solicitudes' }).click()
  await expect(page).toHaveURL(/page=3/)
  await expect(page.getByLabel('Buscar', { exact: true })).toHaveValue(
    'BO Solicitud',
  )
  await page.goto('/admin/people?q=BO%20Fixture%200520')
  await expect(
    page.getByRole('link', { name: 'BO Fixture 0520', exact: true }),
  ).toBeVisible()
  await page.goto('/admin/people?q=bo-fixture-520%40example.test')
  await expect(
    page.getByText('bo-fixture-520@example.test', { exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'BO Fixture 0520', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'BO Fixture 0520', exact: true }),
  ).toBeVisible()
  await page.getByText('Nueva matrícula', { exact: true }).click()
  await expect(page.getByLabel('Programa', { exact: true })).toContainText(
    'BO Entrenamiento local',
  )
})

test('approved application links an existing student and enrollment retries do not duplicate records', async ({
  page,
}) => {
  sql(
    "update public.membership_applications set status='new',linked_user_id=null,completed_at=null where id='93000000-0000-0000-0000-000000000061';",
  )
  await login(
    page,
    'admin',
    '/admin/applications/93000000-0000-0000-0000-000000000061',
  )
  await page.getByLabel('Estado', { exact: true }).selectOption('approved')
  await page.getByLabel('Notas internas').fill('Revisada en la prueba local.')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Revisión guardada' }),
  ).toBeVisible()
  await page
    .getByLabel('Buscar alumno/a existente', { exact: true })
    .fill('BO Fixture 0520')
  const select = page.getByLabel('Alumno/a existente', { exact: true })
  await expect(select).toContainText('BO Fixture 0520')
  await select.selectOption('92000000-0000-0000-0000-000000000520')
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Vincular persona existente' }).click()
  await expect(page.getByText(/Vinculada a BO Fixture 0520/)).toBeVisible()
  const program = page.getByLabel('Programa', { exact: true })
  await expect(program).toContainText('BO Entrenamiento local')
  await program.selectOption('910001')
  await page.getByRole('button', { name: 'Activar matrícula' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'matrícula activa' }),
  ).toBeVisible()
  await program.selectOption('910001')
  await page.getByRole('button', { name: 'Activar matrícula' }).click()
  expect(
    sql(
      "select count(*) from public.enrollments where user_id='92000000-0000-0000-0000-000000000520' and program_id=910001",
    ),
  ).toBe('1')
  expect(
    sql(
      "select completed_at is not null from public.membership_applications where id='93000000-0000-0000-0000-000000000061'",
    ),
  ).toBe('t')
})

test('creating an account sends to local Auth mail, links the application and survives a repeated request', async ({
  page,
}) => {
  const email = `bo-onboard-${Date.now()}@example.test`
  sql(
    "update public.membership_applications set status='approved',linked_user_id=null,completed_at=null where id='93000000-0000-0000-0000-000000000060'",
  )
  await login(
    page,
    'admin',
    '/admin/applications/93000000-0000-0000-0000-000000000060',
  )
  await page
    .getByLabel('Nombre completo', { exact: true })
    .fill('BO Nuevo alumno')
  await page.getByLabel('Correo electrónico', { exact: true }).fill(email)
  await page
    .getByRole('button', { name: 'Crear cuenta y enviar acceso' })
    .click()
  await expect(page.getByText(/Vinculada a BO Nuevo alumno/)).toBeVisible()
  const id = sql(
    "select linked_user_id from public.membership_applications where id='93000000-0000-0000-0000-000000000060'",
  )
  await page.goto(`/admin/people/${id}`)
  await expect(page.getByText(/Envío: Enviada/)).toBeVisible()
  expect(sql(`select count(*) from auth.users where email='${email}'`)).toBe(
    '1',
  )
  // Immediate retries are rejected before a second mail is issued.
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reenviar acceso' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Espera un minuto' }),
  ).toBeVisible()
  expect(
    sql(
      `select attempts from public.account_invitations where email='${email}'`,
    ),
  ).toBe('1')
  const messages = await page.request
    .get('http://127.0.0.1:54324/api/v1/messages')
    .then((response) => response.json())
  const message = messages.messages.find(
    (item: { To: { Address: string }[] }) =>
      item.To.some((recipient) => recipient.Address === email),
  )
  expect(message).toBeTruthy()
  const mail = await page.request
    .get(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)
    .then((response) => response.json())
  const href = String(mail.HTML)
    .match(/href="([^"]*\/auth\/v1\/verify[^"]*)"/)?.[1]
    ?.replaceAll('&amp;', '&')
  expect(href).toBeTruthy()
  expect(new URL(href!).hostname).toBe('127.0.0.1')
  // Keep the callback on the isolated local port even if the running Auth
  // container still has the repository's production site_url allow-list.
  const verified = await page.request.get(href!, { maxRedirects: 0 })
  const callback = new URL(verified.headers().location)
  expect(callback.hash).toContain('access_token=')
  await page.context().clearCookies()
  await page.goto(`/auth/update-password${callback.hash}`)
  await expect(
    page.getByRole('heading', { name: 'Establecer nueva contraseña' }),
  ).toBeVisible()
  const passwordFields = page.locator('input[type=password]')
  await passwordFields.nth(0).fill('New-Local-Password!2026')
  await passwordFields.nth(1).fill('New-Local-Password!2026')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(
    sql(
      `select last_sign_in_at is not null from auth.users where email='${email}'`,
    ),
  ).toBe('t')
})

test('coach can mark attendance and correct it with an audited reason', async ({
  page,
}) => {
  await login(page, 'coach', '/coach/attendance?session=910001')
  const row = page.locator('li').filter({
    has: page.getByRole('heading', { name: 'BO Alumno', exact: true }),
  })
  page.on('dialog', (dialog) => dialog.accept())
  if (await row.getByText('Corregir asistencia', { exact: true }).isVisible()) {
    await row.getByText('Corregir asistencia', { exact: true }).click()
    await row
      .getByLabel('Motivo de la corrección')
      .fill('Limpiar asistencia de prueba anterior')
    await row.getByRole('button', { name: 'Retirar asistencia' }).click()
  }
  await row.getByRole('button', { name: 'Marcar presente' }).click()
  await expect(row.getByText(/Presente ·/)).toBeVisible()
  await row.getByText('Corregir asistencia', { exact: true }).click()
  await row
    .getByLabel('Motivo de la corrección')
    .fill('Alumno marcado por error en prueba local')
  await row.getByRole('button', { name: 'Retirar asistencia' }).click()
  await expect(
    row.getByRole('button', { name: 'Marcar presente' }),
  ).toBeVisible()
  expect(
    sql(
      "select count(*)>0 from public.backoffice_audit where entity='attendance_logs' and reason='Alumno marcado por error en prueba local'",
    ),
  ).toBe('t')
})

test('session creation uses named programs and Madrid time; empty sessions can be removed', async ({
  page,
}) => {
  sql(
    "delete from public.attendance_sessions where program_id=910001 and start_at='2027-01-15T17:30:00Z' and not exists(select 1 from public.attendance_logs where session_id=attendance_sessions.id)",
  )
  await login(page, 'coach', '/coach/sessions')
  await page.getByText('Crear nueva sesión', { exact: true }).click()
  const form = page
    .locator('details')
    .filter({ has: page.getByText('Crear nueva sesión', { exact: true }) })
  await expect(form.getByLabel('Programa', { exact: true })).toContainText(
    'BO Entrenamiento local',
  )
  await form.getByLabel('Programa', { exact: true }).selectOption('910001')
  await form.getByLabel('Inicio', { exact: true }).fill('2027-01-15T18:30')
  await form.getByLabel('Fin', { exact: true }).fill('2027-01-15T19:30')
  await form.getByRole('button', { name: 'Crear sesión', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Sesión creada.' }),
  ).toBeVisible()
  expect(
    sql(
      "select count(*)>0 from public.attendance_sessions where program_id=910001 and start_at='2027-01-15T17:30:00Z'",
    ),
  ).toBe('t')
  await page.goto('/coach/sessions?date=2027-01-15')
  const card = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', {
        name: 'BO Entrenamiento local',
        exact: true,
      }),
    })
    .first()
  await card.getByText('Editar sesión', { exact: true }).click()
  await expect(
    card
      .locator('details')
      .filter({ has: page.getByText('Editar sesión', { exact: true }) })
      .getByLabel('Inicio', { exact: true }),
  ).toHaveValue('2027-01-15T18:30')
  page.on('dialog', (dialog) => dialog.accept())
  await card.getByRole('button', { name: 'Eliminar si está vacía' }).click()
  await expect(card).not.toBeVisible()
  expect(
    sql(
      "select count(*) from public.attendance_sessions where program_id=910001 and start_at='2027-01-15T17:30:00Z'",
    ),
  ).toBe('0')
})

test('exports contain the complete filtered list and student endpoints reject admin access', async ({
  page,
}) => {
  await login(page, 'admin', '/admin')
  const download = await page.request.get(
    '/api/backoffice/export?kind=applications&q=BO%20Solicitud',
  )
  expect(download.ok()).toBeTruthy()
  expect((await download.text()).trim().split('\r\n')).toHaveLength(62)
  await page.context().clearCookies()
  await login(page, 'student')
  expect(
    (await page.request.get('/api/backoffice/options?kind=people')).status(),
  ).toBe(403)
  expect(
    (await page.request.get('/api/backoffice/export?kind=people')).status(),
  ).toBe(403)
})

test('mobile navigation fits the viewport and search failures offer a retry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page, 'admin', '/admin/programs/910001')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy()
  await page.route('**/api/backoffice/options**', (route) =>
    route.fulfill({ status: 503, body: '{}' }),
  )
  await page.getByLabel('Buscar responsable', { exact: true }).fill('error')
  await expect(
    page.getByRole('alert').filter({ hasText: 'No se pudo cargar' }),
  ).toBeVisible()
  await page.unroute('**/api/backoffice/options**')
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'No se pudo cargar' }),
  ).not.toBeVisible()
})
