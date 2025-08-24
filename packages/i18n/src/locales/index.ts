// No pongas 'use client' aquí
import es from "./es.json"
import en from "./en.json"
import ca from "./ca.json"

export type Language = "es" | "en" | "ca"
export type Dict = Record<string, unknown>

export const LOCALES: Record<Language, Dict> = { es, en, ca }
