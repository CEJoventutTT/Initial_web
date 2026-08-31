/// <reference types="jest" />

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import emailjs from '@emailjs/browser'
import Contact from '@/components/contact'

jest.mock('@emailjs/browser', () => ({
  __esModule: true,
  default: { send: jest.fn() },
}))

jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('contact form', () => {
  const send = jest.mocked(emailjs.send)

  beforeEach(() => {
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = 'service_test'
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'template_test'
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID2 = 'template_auto_reply_test'
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = 'public_test'
    send.mockResolvedValue({ status: 200, text: 'OK' })
    jest.spyOn(window, 'alert').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends the visitor message through EmailJS', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    await user.type(screen.getByPlaceholderText('contact.firstName'), 'Ada')
    await user.type(screen.getByPlaceholderText('contact.lastName'), 'Lovelace')
    await user.type(screen.getByPlaceholderText('Email'), 'ada@example.test')
    await user.type(screen.getByPlaceholderText('contact.phone'), '+34600111222')
    await user.type(screen.getByPlaceholderText('contact.subject'), 'Consulta')
    await user.type(screen.getByPlaceholderText('contact.message'), 'Mensaje de prueba')
    await user.click(screen.getByRole('button', { name: 'contact.sendMessageBtn' }))

    await waitFor(() => {
      expect(send).toHaveBeenNthCalledWith(
        1,
        'service_test',
        'template_test',
        expect.objectContaining({
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.test',
          subject: 'Consulta',
        }),
        'public_test',
      )
      expect(send).toHaveBeenNthCalledWith(
        2,
        'service_test',
        'template_auto_reply_test',
        expect.objectContaining({
          firstName: 'Ada',
          email: 'ada@example.test',
          message: 'Mensaje de prueba',
        }),
        'public_test',
      )
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('mensaje ha sido enviado'))
    })
  })
})
