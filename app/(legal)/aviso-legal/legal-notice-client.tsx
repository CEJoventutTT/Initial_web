// app/(legal)/aviso-legal/legal-notice-client.tsx
"use client"

import { useTranslation } from "@/lib/i18n"

export default function LegalNoticeClient() {
  const { t } = useTranslation()

  return (
    <>
      <h1>{t("legal.notice.title")}</h1>

      <h2>{t("legal.notice.identification")}</h2>
      <p>{t("legal.notice.identIntro")}</p>
      <ul>
        <li><strong>{t("legal.shared.entity")}:</strong> Club Esportiu Joventut TT</li>
        <li><strong>{t("legal.shared.taxId")}:</strong> G22554984</li>
        <li><strong>{t("legal.shared.address")}:</strong> Club Robinson 350, 07830, Sant Josep de sa Talaia, Illes Balears</li>
        <li><strong>{t("legal.shared.email")}:</strong> ce.joventut.tt@gmail.com</li>
        <li><strong>{t("legal.shared.phone")}:</strong> +34 644 978 857</li>
      </ul>

      <h2>{t("legal.notice.use")}</h2>
      <p>{t("legal.notice.useIntro")}</p>
      <ul>
        <li>{t("legal.notice.useItem1")}</li>
        <li>{t("legal.notice.useItem2")}</li>
        <li>{t("legal.notice.useItem3")}</li>
      </ul>

      <h2>{t("legal.notice.ip")}</h2>
      <p>{t("legal.notice.ipText")}</p>

      <h2>{t("legal.notice.disclaimer")}</h2>
      <ul>
        <li>{t("legal.notice.disc1")}</li>
        <li>{t("legal.notice.disc2")}</li>
        <li>{t("legal.notice.disc3")}</li>
      </ul>

      <h2>{t("legal.notice.law")}</h2>
      <p>{t("legal.notice.lawText")}</p>
    </>
  )
}
