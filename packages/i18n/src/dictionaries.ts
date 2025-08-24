import es from './locales/es.json'
import ca from './locales/ca.json'
import en from './locales/en.json'

export type Language = 'es' | 'ca' | 'en'
export type Dict = Record<string, any>

export const dictionaries: Record<Language, Dict> = { es, ca, en }
