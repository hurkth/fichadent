/** URL pública del sitio (canonical, sitemap, Open Graph). Configurable con NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fichadent.com').replace(/\/$/, '');
