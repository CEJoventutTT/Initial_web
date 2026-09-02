/// <reference types="jest" />

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JoinPage from '@/components/join/JoinClient'

const toast = jest.fn()

jest.mock('@/components/navigation', () => () => null)
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }))
jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('join form', () => {
  beforeEach(() => {
    toast.mockClear()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, id: 'test-application' }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('posts a validated application to the server endpoint', async () => {
    const user = userEvent.setup()
    render(<JoinPage />)

    await user.type(screen.getByLabelText('join.fullName *'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('join.birthDate *'), '2000-01-01')
    await user.type(screen.getByLabelText('join.municipality *'), 'Sant Josep')
    await user.type(screen.getByLabelText('join.phone *'), '+34600111222')
    await user.type(screen.getByLabelText('join.email *'), 'ada@example.test')
    await user.type(screen.getByLabelText('join.referralSource *'), 'Web')
    const [competitionInterest, eventInterest] = document.querySelectorAll('fieldset')
    await user.click(within(competitionInterest).getByRole('radio', { name: 'join.options.yes' }))
    await user.click(within(eventInterest).getByRole('radio', { name: 'join.options.no' }))
    await user.click(screen.getByRole('checkbox'))
    fireEvent.submit(document.querySelector('form')!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/center-activity', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Idempotency-Key': expect.stringMatching(/^[A-Za-z0-9_-]{16,128}$/),
        }),
        body: JSON.stringify({
          fullName: 'Ada Lovelace',
          birthDate: '2000-01-01',
          municipality: 'Sant Josep',
          phone: '+34600111222',
          email: 'ada@example.test',
          referralSource: 'Web',
          competitionInterest: 'yes',
          eventInterest: 'no',
          dataProtectionConsent: true,
        }),
      }))
      expect(toast).toHaveBeenCalledWith({
        title: 'common.success',
        description: 'join.reviewMessage',
      })
    })
  })
})
