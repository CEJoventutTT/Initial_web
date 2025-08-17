import type { Metadata } from "next"
import CookiesClient from "./cookies-client"

export const metadata: Metadata = {
  title: "Política de Cookies | Club Esportiu Joventut",
  description: "Política de cookies del Club Esportiu Joventut."
}

export default function Page() {
  return (
    <section className="prose prose-invert max-w-none">
      <CookiesClient />
    </section>
  )
}
