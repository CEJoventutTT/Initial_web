import { test } from 'node:test'
import assert from 'node:assert/strict'
import { csvRow } from '../lib/backoffice/csv.ts'
import { backUrl, listParams, listUrl } from '../lib/backoffice/list.ts'
test('CSV escapes quotes, line breaks and spreadsheet formulas', () => {
  assert.equal(csvRow(['Ana "A"', '=HYPERLINK("x")', 'a\nb']), '"Ana ""A""","\'=HYPERLINK(""x"")","a\nb"\r\n')
})
test('list navigation preserves filters and limits return URLs to its own list', () => {
  assert.equal(listParams({ page: '-1' }).page, 1)
  assert.equal(listParams({ page: '3' }).from, 50)
  assert.equal(listUrl('/admin/people', { q: 'Ana', role: 'student', page: '1' }, { page: '2' }), '/admin/people?q=Ana&role=student&page=2')
  assert.equal(backUrl('https://evil.test', '/admin/people'), '/admin/people')
  assert.equal(backUrl('/admin/people?q=Ana', '/admin/people'), '/admin/people?q=Ana')
})
