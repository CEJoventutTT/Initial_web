"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import LanguageSelector from "@/components/language-selector"

export default function LegalTopBar() {
  const { t } = useTranslation()

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto w-full max-w-5xl px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.backHome")}</span>
        </Link>

        <div className="ml-auto">
          {/* tu selector existente, reutilizado aquí */}
          <LanguageSelector />
        </div>
      </div>
    </div>
  )
}
