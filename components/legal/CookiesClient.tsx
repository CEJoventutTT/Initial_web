// app/(legal)/politica-cookies/cookies-client.tsx
"use client"

import { useTranslation } from "@/lib/i18n"

export default function CookiesClient() {
  const { t } = useTranslation()

  const reopenBanner = (e: React.MouseEvent) => {
    e.preventDefault()
    document.dispatchEvent(new CustomEvent("open-cookie-banner"))
  }

  return (
    <>
      <h1>{t("legal.cookies.title")}</h1>

      <h2>{t("legal.cookies.what")}</h2>
      <p>{t("legal.cookies.whatText")}</p>

      <h2>{t("legal.cookies.types")}</h2>
      <ul>
        <li>{t("legal.cookies.tTech")}</li>
        <li>{t("legal.cookies.tPrefs")}</li>
        <li>{t("legal.cookies.tAnalytics")}</li>
        <li>{t("legal.cookies.tMarketing")}</li>
      </ul>

      <h2>{t("legal.cookies.purpose")}</h2>
      <p>{t("legal.cookies.purposeText")}</p>

      <h2>{t("legal.cookies.manage")}</h2>
      <p>{t("legal.cookies.manageText")}</p>

      <h2>{t("legal.cookies.review")}</h2>
      <p>
        {t("legal.cookies.reviewText")}{" "}
        <a href="#" onClick={reopenBanner}>{t("legal.cookies.reviewCta")}</a>.
      </p>
    </>
  )
}
