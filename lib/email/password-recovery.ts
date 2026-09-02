import 'server-only'

import { deliverEmail } from '@/lib/email/transport'

type PasswordRecoveryEmail = {
  to: string
  resetUrl: string
  idempotencyKey: string
}

export async function sendPasswordRecoveryEmail({ to, resetUrl, idempotencyKey }: PasswordRecoveryEmail) {
  return deliverEmail('acknowledgement', {
    firstName: '',
    lastName: '',
    email: to,
    phone: '',
    subject: 'Restablece tu contraseña — CE Joventut TT',
    message: `Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.\n\nAbre este enlace para crear una nueva contraseña:\n${resetUrl}\n\nEste enlace es de un solo uso. Si no solicitaste el cambio, puedes ignorar este correo.`,
  }, idempotencyKey)
}
