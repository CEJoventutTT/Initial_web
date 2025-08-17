import type { Metadata } from "next"
import LegalNoticeClient from "./legal-notice-client"

export const metadata: Metadata = {
  title: "Aviso Legal | Club Esportiu Joventut",
  description: "Aviso legal del Club Esportiu Joventut - Sant Josep de sa Talaia, Ibiza, Baleares."
}

export default function Page() {
  return (
    <section className="prose prose-invert max-w-none">
      <LegalNoticeClient />
    </section>
  )
}
