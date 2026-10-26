import type { MetadataRoute } from 'next';

/** PWA: al instalarla en la tablet abre directo el consultorio. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fichadent',
    short_name: 'Fichadent',
    description: 'Historia clínica dental y agenda para tu consultorio.',
    lang: 'es-PE',
    start_url: '/inicio',
    display: 'standalone',
    background_color: '#F7F6F3',
    theme_color: '#0F766E',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
