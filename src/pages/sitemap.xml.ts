/**
 * sitemap.xml: both language versions, each listing the other as an
 * alternate (hreflang), so search engines pair them.
 */
import type { APIRoute } from "astro";
import { locales } from "../i18n";
import { SITE } from "../seo/structured-data";

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const alternates = [
    ...Object.entries(locales).map(([code, { route }]) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${SITE}${route}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`,
  ].join("\n");
  const urls = Object.values(locales)
    .map(({ route }) => `  <url>\n    <loc>${SITE}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
