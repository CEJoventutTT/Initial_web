import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { login } from './helpers'
import sharp from 'sharp'

test.skip(
  process.env.E2E_BACKOFFICE_LOCAL !== '1',
  'Local Supabase runner required',
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
test('editorial lifecycle, private images, stable URL, preview and history', async ({
  page,
  browser,
}) => {
  test.setTimeout(90000)
  const title = `BO Noticia ${Date.now()}`
  await login(page, 'admin', '/admin/news')
  expect(
    (
      await page.request.post('/api/backoffice/news/images', {
        headers: { origin: 'https://foreign.example' },
      })
    ).status(),
  ).toBe(403)
  expect(
    (
      await page.request.post('/api/backoffice/news/images', {
        multipart: {
          image: {
            name: 'fake.png',
            mimeType: 'image/png',
            buffer: Buffer.from('<svg></svg>'),
          },
        },
      })
    ).status(),
  ).toBe(400)
  await page.getByRole('link', { name: 'Nueva noticia', exact: true }).click()
  await page.getByLabel('Título', { exact: true }).fill(title)
  await page.getByLabel('Tipo de noticia').selectOption('internal')
  await page.getByLabel('Idioma', { exact: true }).selectOption('es')
  await page
    .getByLabel('Resumen', { exact: true })
    .fill('Resumen de la noticia de prueba')
  await page
    .getByLabel('Contenido', { exact: true })
    .fill(
      '## Actividad del club\n\nContenido **completo** del artículo.\n\n<script>alert("no")</script>',
    )
  await page.getByLabel('Subir portada', { exact: false }).setInputFiles({
    name: 'cover.png',
    mimeType: 'image/png',
    buffer: await sharp({
      create: { width: 32, height: 32, channels: 3, background: '#b1e346' },
    })
      .png()
      .toBuffer(),
  })
  await expect(page.getByLabel('URL de portada')).toHaveValue(
    /\/api\/news\/images\/.+\.webp$/,
  )
  const image = await page.getByLabel('URL de portada').inputValue()
  await page.getByLabel('Descripción de la imagen').fill('Portada de prueba')
  await page
    .getByRole('button', { name: 'Guardar borrador', exact: true })
    .click()
  await expect(page).toHaveURL(/\/admin\/news\/[0-9a-f-]{36}/)
  const id = new URL(page.url()).pathname.split('/').pop()!
  const slug = sql(
    `select slug from public.news_articles where admin_id='${id}';`,
  )
  const anonymous = await browser.newContext(),
    publicPage = await anonymous.newPage()
  expect((await anonymous.request.get(image)).status()).toBe(404)
  expect((await anonymous.request.get(`/news/${slug}`)).status()).toBe(404)
  const preview = await page.context().newPage()
  await preview.goto(`/admin/news/${id}/preview`)
  await expect(
    preview.getByRole('heading', { name: 'Actividad del club' }),
  ).toBeVisible()
  await expect(preview.getByAltText('Portada de prueba')).toBeVisible()
  await expect.poll(() => preview.getByAltText('Portada de prueba').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  await expect(preview.locator('article script')).toHaveCount(0)
  expect((await page.request.get(image)).status()).toBe(200)
  await preview.close()
  await page.getByRole('button', { name: 'Publicar', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Noticia publicada' }),
  ).toBeVisible()
  expect((await anonymous.request.get(image)).status()).toBe(200)
  await publicPage.goto(`/news/${slug}`)
  await expect(
    publicPage.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible()
  await expect(
    publicPage.getByText('Contenido completo del artículo.'),
  ).toBeVisible()
  const list = await (await anonymous.request.get('/api/news')).json()
  expect(list.items.find((item: { slug: string }) => item.slug === slug)).toBeTruthy()
  expect(await (await anonymous.request.get('/sitemap.xml')).text()).toContain(
    `/news/${slug}`,
  )
  await page.getByLabel('Título', { exact: true }).fill(`${title} editada`)
  await page.getByRole('button', { name: 'Guardar cambios publicados' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Noticia publicada' }),
  ).toBeVisible()
  expect(
    sql(`select slug from public.news_articles where admin_id='${id}';`),
  ).toBe(slug)
  await page.getByRole('button', { name: 'Retirar a borrador' }).click()
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Publicar', exact: true }),
  ).toBeVisible()
  expect((await anonymous.request.get(image)).status()).toBe(404)
  expect((await anonymous.request.get(`/news/${slug}`)).status()).toBe(404)
  expect(
    await (await anonymous.request.get('/sitemap.xml')).text(),
  ).not.toContain(`/news/${slug}`)
  expect(
    (await (await anonymous.request.get('/api/news')).json()).items.some(
      (item: { slug: string }) => item.slug === slug,
    ),
  ).toBe(false)
  await page.getByRole('button', { name: 'Archivar', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Restaurar a borrador' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Restaurar a borrador' }).click()
  await expect(
    page.getByRole('button', { name: 'Publicar', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Historial de cambios' }),
  ).toBeVisible()
  expect(
    sql(
      `select count(*) from public.backoffice_audit where entity='news_articles' and entity_id='${id}';`,
    ),
  ).toBe('6')
  await anonymous.close()
})
test('concurrent edits and validation preserve entered content', async ({
  page,
}) => {
  await login(page, 'admin', '/admin/news/new')
  await page
    .getByLabel('Título', { exact: true })
    .fill(`BO Conflicto ${Date.now()}`)
  await page
    .getByRole('button', { name: 'Guardar borrador', exact: true })
    .click()
  await expect(page).toHaveURL(/\/admin\/news\/[0-9a-f-]{36}/)
  await page.getByRole('button', { name: 'Publicar', exact: true }).click()
  await expect(
    page.getByText('Escribe un resumen antes de publicar.', { exact: true }),
  ).toBeVisible()
  const other = await page.context().newPage()
  await other.goto(page.url())
  await other
    .getByLabel('Título', { exact: true })
    .fill('BO Edición de otra persona')
  await other
    .getByRole('button', { name: 'Guardar borrador', exact: true })
    .click()
  await expect(
    other.getByRole('status').filter({ hasText: 'Noticia guardada' }),
  ).toBeVisible()
  await page
    .getByLabel('Título', { exact: true })
    .fill('BO Mi edición pendiente')
  await page
    .getByRole('button', { name: 'Guardar borrador', exact: true })
    .click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Otra persona ha modificado' }),
  ).toBeVisible()
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue(
    'BO Mi edición pendiente',
  )
  await other.close()
})
test('list pagination, filter return, mobile and external article', async ({
  page,
}) => {
  sql(
    `insert into public.news_articles(id,title,excerpt,date,read_time,image,categories,external_url,lang,status) select 'bo-news-page-'||n,'BO Paginación '||lpad(n::text,3,'0'),'Resumen',now(),'1 min','/placeholder.svg',array['news'],'https://example.test/news-page-'||n,'es','draft' from generate_series(1,31)n on conflict do nothing;`,
  )
  sql(
    "update public.news_articles set status='draft' where id like 'bo-news-page-%';",
  )
  await login(page, 'admin', '/admin/news')
  await page.getByLabel('Buscar', { exact: true }).fill('BO Paginación')
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click()
  await expect(page.getByText('31 registros · Página 1 de 2')).toBeVisible()
  await page.getByRole('link', { name: 'Siguiente', exact: true }).click()
  await expect(page.getByText('31 registros · Página 2 de 2')).toBeVisible()
  await page.locator('tbody a').first().click()
  await page.getByRole('button', { name: 'Publicar', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Noticia publicada' }),
  ).toBeVisible()
  const id = new URL(page.url()).pathname.split('/').pop()!
  const slug = sql(
    `select slug from public.news_articles where admin_id='${id}';`,
  )
  const preview = await page.context().newPage()
  await preview.goto(`/news/${slug}`)
  await expect(preview.getByText('Fuente original: example.test')).toBeVisible()
  await expect(
    preview.getByRole('link', { name: 'Leer noticia completa' }),
  ).toHaveAttribute('href', /^https:\/\/example.test\/news-page-/)
  await preview.close()
  await page.getByRole('link', { name: '← Volver a noticias' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByLabel('Buscar', { exact: true })).toHaveValue(
    'BO Paginación',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'tmp/news-mobile.png', fullPage: true })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})
test('non-admins cannot access editor or upload portadas', async ({ page }) => {
  for (const role of ['coach', 'student'] as const) {
    await page.context().clearCookies()
    await login(page, role)
    await page.goto('/admin/news')
    await expect(page).toHaveURL(/\/dashboard$/)
    expect(
      (await page.request.post('/api/backoffice/news/images')).status(),
    ).toBe(403)
  }
})
