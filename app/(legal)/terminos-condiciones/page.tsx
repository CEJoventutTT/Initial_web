import type { Metadata } from "next"
import TermsClient from "./terms-client"

export const metadata: Metadata = {
  title: "Términos y Condiciones | Club Esportiu Joventut",
  description: "Términos y Condiciones del sitio del Club Esportiu Joventut."
}

export default function Page() {
  return (
    <section className="prose prose-invert max-w-none">
      <TermsClient />
    </section>
  )
}
