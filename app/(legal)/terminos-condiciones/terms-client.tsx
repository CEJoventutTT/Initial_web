// app/(legal)/terminos-condiciones/terms-client.tsx
"use client"

import { useTranslation } from "@/lib/i18n"

export default function TermsClient() {
  const { t } = useTranslation()

  return (
    <>
      <h1>{t("legal.terms.title")}</h1>

      <h2>{t("legal.terms.object")}</h2>
      <p>{t("legal.terms.objectText")}</p>

      <h2>{t("legal.terms.signup")}</h2>
      <ul>
        <li>{t("legal.terms.s1")}</li>
        <li>{t("legal.terms.s2")}</li>
        <li>{t("legal.terms.s3")}</li>
      </ul>

      <h2>{t("legal.terms.services")}</h2>
      <p>{t("legal.terms.servicesText")}</p>

      <h2>{t("legal.terms.rules")}</h2>
      <ul>
        <li>{t("legal.terms.r1")}</li>
        <li>{t("legal.terms.r2")}</li>
        <li>{t("legal.terms.r3")}</li>
      </ul>

      <h2>{t("legal.terms.liability")}</h2>
      <ul>
        <li>{t("legal.terms.l1")}</li>
        <li>{t("legal.terms.l2")}</li>
        <li>{t("legal.terms.l3")}</li>
      </ul>

      <h2>{t("legal.terms.claims")}</h2>
      <p>{t("legal.terms.claimsText")}</p>

      <h2>{t("legal.terms.law")}</h2>
      <p>{t("legal.terms.lawText")}</p>
    </>
  )
}
