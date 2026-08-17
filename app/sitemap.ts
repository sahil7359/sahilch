import type { MetadataRoute } from 'next';
import { getAllWork } from '@/lib/content/work';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();
  const work = getAllWork()
    .filter((w) => w.status === 'shipped')
    .map((w) => ({ url: `${base}/work/${w.slug}`, lastModified: now, priority: 0.7 }));

  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/dimension`, lastModified: now, priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3 },
    ...work,
  ];
}
