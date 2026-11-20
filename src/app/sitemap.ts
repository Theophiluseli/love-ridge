import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://loveridgeproperty.com';
  const routes = [
    '',
    '/properties',
    '/products',
    '/businesses',
    '/services',
    '/about',
    '/contact',
    '/gallery',
    '/privacy-policy',
    '/terms-and-conditions',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/properties' || route === '/products' || route === '/businesses' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
