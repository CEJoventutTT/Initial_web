// app/sitemap.ts
import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://cejoventut.com'
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/trainings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/competition-results`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/news`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/join`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/teams`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 }, // si existe
  ]
}
