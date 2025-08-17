import type { Metadata } from "next"
import PrivacyClient from "./privacy-client"

export const metadata: Metadata = {
  title: "Política de Privacidad | Club Esportiu Joventut",
  description: "Política de privacidad (RGPD/LOPDGDD) del Club Esportiu Joventut."
}

export default function Page() {
  return (
    <section className="prose prose-invert max-w-none">
      <PrivacyClient />
    </section>
  )
}
