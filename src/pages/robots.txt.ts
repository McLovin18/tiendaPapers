import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "text/plain");

  res.send(`
User-agent: *
Allow: /

# Sitemap
Sitemap: https://tiffanysec.com/sitemap.xml

# Directorios permitidos
Allow: /products/
Allow: /auth/
Allow: /cart
Allow: /profile
Allow: /favourite

# Archivos estáticos
Allow: /images/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.svg
Allow: /*.webp

Crawl-delay: 1
  `);
}
