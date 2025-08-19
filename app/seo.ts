// app/seo.ts
export type Lang = 'es' | 'en' | 'ca'
export type PageKey =
  | 'home'
  | 'who'
  | 'trainings'
  | 'competition'
  | 'news'
  | 'gallery'
  | 'join'
  | 'contact'
  | 'legal_privacy'
  | 'legal_terms'
  | 'legal_cookies'
  | 'legal_aviso'


export const SEO_TEXT: Record<PageKey, Record<Lang, { title: string; description: string }>> = {
  home: {
    es: {
      title: 'Club Esportiu Joventut TT - Tenis de mesa en Ibiza',
      description:
        'Club inclusivo de tenis de mesa en Sant Josep de sa Talaia, Ibiza. Entrenamientos y actividades para todas las edades y niveles.',
    },
    en: {
      title: 'Club Esportiu Joventut TT - Table Tennis in Ibiza',
      description:
        'Inclusive table tennis club in Sant Josep de sa Talaia, Ibiza. Training and activities for all ages and levels.',
    },
    ca: {
      title: 'Club Esportiu Joventut TT - Tennis taula a Eivissa',
      description:
        'Club inclusiu de tennis taula a Sant Josep de sa Talaia, Eivissa. Entrenaments i activitats per a totes les edats i nivells.',
    },
  },
  who: {
    es: {
      title: 'Quiénes somos | Club Esportiu Joventut TT',
      description: 'Historia, misión y valores del club. Proyecto inclusivo que fomenta deporte y comunidad.',
    },
    en: {
      title: 'About Us | Club Esportiu Joventut TT',
      description: 'History, mission and values of the club. An inclusive project that promotes sport and community.',
    },
    ca: {
      title: 'Qui som | Club Esportiu Joventut TT',
      description: 'Història, missió i valors del club. Projecte inclusiu que promou esport i comunitat.',
    },
  },
  trainings: {
    es: {
      title: 'Entrenamientos y actividades | Club Esportiu Joventut TT',
      description: 'Sesiones de tenis de mesa para todos los niveles. Actividades para jóvenes, adultos y mayores.',
    },
    en: {
      title: 'Training & Activities | Club Esportiu Joventut TT',
      description: 'Table tennis sessions for every level. Activities for youth, adults and seniors.',
    },
    ca: {
      title: 'Entrenaments i activitats | Club Esportiu Joventut TT',
      description: 'Sessions per a tots els nivells. Activitats per a joves, adults i gent gran.',
    },
  },
  competition: {
    es: { title: 'Competición y resultados | Club Esportiu Joventut TT', description: 'Resultados de equipos y jugadores en competiciones oficiales.' },
    en: { title: 'Competition & Results | Club Esportiu Joventut TT', description: 'Teams and players results in official competitions.' },
    ca: { title: 'Competició i resultats | Club Esportiu Joventut TT', description: 'Resultats d’equips i jugadors en competicions oficials.' },
  },
  news: {
    es: { title: 'Noticias y eventos | Club Esportiu Joventut TT', description: 'Últimas noticias, torneos y eventos del club.' },
    en: { title: 'News & Events | Club Esportiu Joventut TT', description: 'Latest news, tournaments and events from the club.' },
    ca: { title: 'Notícies i esdeveniments | Club Esportiu Joventut TT', description: 'Últimes notícies, tornejos i esdeveniments del club.' },
  },
  gallery: {
    es: { title: 'Galería multimedia | Club Esportiu Joventut TT', description: 'Imágenes y vídeos de entrenamientos, competiciones y actividades.' },
    en: { title: 'Media Gallery | Club Esportiu Joventut TT', description: 'Photos and videos from trainings, competitions and activities.' },
    ca: { title: 'Galeria multimèdia | Club Esportiu Joventut TT', description: 'Imatges i vídeos d’entrenaments, competicions i activitats.' },
  },
  join: {
    es: { title: 'Hazte socio | Club Esportiu Joventut TT', description: 'Únete al club y disfruta del tenis de mesa y un ambiente inclusivo en Ibiza.' },
    en: { title: 'Become a Member | Club Esportiu Joventut TT', description: 'Join the club and enjoy table tennis and an inclusive environment in Ibiza.' },
    ca: { title: 'Fes-te soci | Club Esportiu Joventut TT', description: 'Uneix-te al club i gaudeix del tennis taula i un ambient inclusiu a Eivissa.' },
  },
  contact: {
    es: { title: 'Contacto | Club Esportiu Joventut TT', description: 'Contacta con el club en Sant Josep de sa Talaia, Ibiza. Dudas e inscripciones.' },
    en: { title: 'Contact | Club Esportiu Joventut TT', description: 'Get in touch with the club in Sant Josep de sa Talaia, Ibiza. Questions and registrations.' },
    ca: { title: 'Contacte | Club Esportiu Joventut TT', description: 'Contacta amb el club a Sant Josep de sa Talaia, Eivissa. Dubtes i inscripcions.' },
  },
  legal_privacy: {
    es: { title: 'Política de privacidad | Club Esportiu Joventut TT', description: 'Información sobre el tratamiento de datos personales del club.' },
    en: { title: 'Privacy Policy | Club Esportiu Joventut TT', description: 'Information about personal data processing at the club.' },
    ca: { title: 'Política de privadesa | Club Esportiu Joventut TT', description: 'Informació sobre el tractament de dades personals del club.' },
  },
legal_aviso: {
  es: {
    title: 'Aviso legal | Club Esportiu Joventut TT',
    description: 'Información legal y condiciones de uso del sitio web del club.'
  },
  en: {
    title: 'Legal Notice | Club Esportiu Joventut TT',
    description: 'Legal information and terms of use of the club’s website.'
  },
  ca: {
    title: 'Avís legal | Club Esportiu Joventut TT',
    description: 'Informació legal i condicions d’ús del lloc web del club.'
  }
},
  legal_terms: {
    es: { title: 'Aviso legal y condiciones | Club Esportiu Joventut TT', description: 'Términos y condiciones de uso del sitio web.' },
    en: { title: 'Legal Notice & Terms | Club Esportiu Joventut TT', description: 'Terms and conditions of use for the website.' },
    ca: { title: 'Avís legal i condicions | Club Esportiu Joventut TT', description: 'Termes i condicions d’ús del lloc web.' },
  },
  legal_cookies: {
    es: { title: 'Política de cookies | Club Esportiu Joventut TT', description: 'Información sobre el uso de cookies en el sitio web.' },
    en: { title: 'Cookies Policy | Club Esportiu Joventut TT', description: 'Information about the use of cookies on the website.' },
    ca: { title: 'Política de cookies | Club Esportiu Joventut TT', description: 'Informació sobre l’ús de cookies al lloc web.' },
  },
}

// cookies() async para evitar el error de Next
import { cookies } from 'next/headers'
export async function getLang(): Promise<Lang> {
  try {
    const store = await cookies()
    const v = store.get('lang')?.value as Lang | undefined
    return v === 'en' || v === 'ca' || v === 'es' ? v : 'es'
  } catch {
    return 'es'
  }
}

export function getSeo(page: PageKey, lang: Lang) {
  return SEO_TEXT[page][lang]
}
