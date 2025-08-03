#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const baseUrl = 'https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com';
const outputPath = path.join(__dirname, '../public/sitemap.xml');

// Define your routes here - update this array when you add new pages
const routes = [
  {
    url: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  },
  // Add more routes as your application grows:
  // {
  //   url: '/avaluo-casas',
  //   lastmod: new Date().toISOString().split('T')[0],
  //   changefreq: 'weekly',
  //   priority: '0.8'
  // },
  // {
  //   url: '/valuacion-departamentos',
  //   lastmod: new Date().toISOString().split('T')[0],
  //   changefreq: 'weekly',
  //   priority: '0.8'
  // }
];

function generateSitemapXML(baseUrl, routes) {
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

// Generate and save sitemap
try {
  const sitemapContent = generateSitemapXML(baseUrl, routes);
  fs.writeFileSync(outputPath, sitemapContent);
  console.log(`✅ Sitemap generated successfully at ${outputPath}`);
  console.log(`📊 Generated ${routes.length} URLs`);
  console.log('🔗 Routes included:');
  routes.forEach(route => {
    console.log(`   - ${baseUrl}${route.url} (${route.priority})`);
  });
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}