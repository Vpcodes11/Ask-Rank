import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/util';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/scan/', '/auth/', '/login'] }],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
