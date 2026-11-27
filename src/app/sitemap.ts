import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/util';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return ['', '/pricing', '/privacy', '/terms'].map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: p ? 0.5 : 1 }));
}
