export const config = {
  runtime: 'edge',
};

export default function Sitemap() {
  const baseUrl = 'https://tiffanysec.com';

  const routes = [
    '',
    '/products',
    '/products/mujer',
    '/products/hombre',
    '/products/ninos',
    '/products/bebe',
    '/products/sport',
    '/auth/login',
    '/auth/register',
    '/cart',
    '/favourite'
  ];

  const urls = routes
    .map(route => {
      return `
        <url>
          <loc>${baseUrl}${route}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    })
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    }
  );
}
