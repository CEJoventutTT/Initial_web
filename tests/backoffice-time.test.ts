import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clubLocalToISO, clubDateTimeInput, clubDayBounds } from '../lib/backoffice/time.ts'

test('Madrid wall times round trip in winter and summer regardless of server timezone', () => {
  assert.equal(clubLocalToISO('2026-01-15T18:30'), '2026-01-15T17:30:00.000Z')
  assert.equal(clubLocalToISO('2026-07-15T18:30'), '2026-07-15T16:30:00.000Z')
  assert.equal(clubDateTimeInput(clubLocalToISO('2026-07-15T18:30')), '2026-07-15T18:30')
})
test('invalid dates, missing DST hours and ambiguous DST hours are rejected', () => {
  for (const value of ['2026-02-30T18:30', '2026-03-29T02:30', '2026-10-25T02:30', 'bad']) {
    assert.throws(() => clubLocalToISO(value))
  }
})
test('club days respect the DST transition', () => {
  const { from, to } = clubDayBounds('2026-03-29')
  assert.equal(Date.parse(to) - Date.parse(from), 23 * 3600_000)
})
