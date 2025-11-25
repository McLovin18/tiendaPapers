export const config = {
  runtime: 'experimental-edge',
};

export default function Robots() {
  return new Response(
    `
User-agent: *
Allow: /

Sitemap: https://tiffanysec.com/sitemap.xml

Allow: /products/
Allow: /auth/
Allow: /cart
Allow: /profile
Allow: /favourite

Allow: /images/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.svg
Allow: /*.webp

Crawl-delay: 1
`.trim(),
    {
      headers: {
        'Content-Type': 'text/plain',
    },
  });
}
