// app/(legal)/politica-privacidad/privacy-client.tsx
"use client"

import { useTranslation } from "@/lib/i18n"

export default function PrivacyClient() {
  const { t } = useTranslation()

  return (
    <>
      <h1>{t("legal.privacy.title")}</h1>

      <h2>{t("legal.privacy.controller")}</h2>
      <ul>
        <li><strong>{t("legal.shared.controller")}:</strong> Club Esportiu Joventut TT</li>
        <li><strong>{t("legal.shared.taxId")}:</strong> G22554984</li>
        <li><strong>{t("legal.shared.address")}:</strong> Carrer Club Robinson, 350, 07830, Sant Josep de sa Talaia, Illes Balears</li>
        <li><strong>{t("legal.shared.email")}:</strong> ce.joventut.tt@gmail.com</li>
      </ul>

      <h2>{t("legal.privacy.purposes")}</h2>
      <ul>
        <li>{t("legal.privacy.p1")}</li>
        <li>{t("legal.privacy.p2")}</li>
        <li>{t("legal.privacy.p3")}</li>
      </ul>

      <h2>{t("legal.privacy.legalBasis")}</h2>
      <ul>
        <li>{t("legal.privacy.lb1")}</li>
        <li>{t("legal.privacy.lb2")}</li>
        <li>{t("legal.privacy.lb3")}</li>
      </ul>

      <h2>{t("legal.privacy.retention")}</h2>
      <p>{t("legal.privacy.retentionText")}</p>

      <h2>{t("legal.privacy.rights")}</h2>
      <p>{t("legal.privacy.rightsText")}</p>

      <h2>{t("legal.privacy.recipients")}</h2>
      <p>{t("legal.privacy.recipientsText")}</p>

      <h2>{t("legal.privacy.transfers")}</h2>
      <p>{t("legal.privacy.transfersText")}</p>

      <h2>{t("legal.privacy.claims")}</h2>
      <p>{t("legal.privacy.claimsText")}</p>
    </>
  )
}
