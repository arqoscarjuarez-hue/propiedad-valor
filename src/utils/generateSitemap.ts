// Generate sitemap.xml automatically based on React Router routes
export interface SitemapURL {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

export const sitemapRoutes: SitemapURL[] = [
  {
    url: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  },
  // Add more routes here as your app grows
  // {
  //   url: '/avaluo-casas',
  //   lastmod: new Date().toISOString().split('T')[0],
  //   changefreq: 'weekly',
  //   priority: '0.8'
  // },
];

export function generateSitemapXML(baseUrl: string, routes: SitemapURL[]): string {
  const urls = routes.map(route => {
    return `  <url>
    <loc>${baseUrl}${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
    ${route.changefreq ? `<changefreq>${route.changefreq}</changefreq>` : ''}
    ${route.priority ? `<priority>${route.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Function to update sitemap in production
export async function updateSitemap() {
  const baseUrl = 'https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com';
  const sitemapContent = generateSitemapXML(baseUrl, sitemapRoutes);
  
  // In a real implementation, you would write this to public/sitemap.xml
  // For now, we'll return the content
  return sitemapContent;
}