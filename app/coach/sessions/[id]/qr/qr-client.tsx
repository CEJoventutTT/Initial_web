// app/coach/sessions/[id]/qr/qr-client.tsx
'use client'
import QRCode from 'react-qr-code'

export default function QR({ value }: { value: string }) {
  return <QRCode value={value} size={256} />
}
