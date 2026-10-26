import { ImageResponse } from 'next/og';

export const alt = 'Fichadent · Historia clínica y agenda para tu consultorio dental';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Imagen al compartir el enlace (WhatsApp, Facebook, LinkedIn). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#ECEEF0',
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(15,118,110,0.55), rgba(15,118,110,0) 55%), radial-gradient(circle at 100% 10%, rgba(255,170,130,0.7), rgba(255,170,130,0) 50%), radial-gradient(circle at 70% 100%, rgba(140,160,255,0.5), rgba(140,160,255,0) 55%)',
          color: '#1D1D1F',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#0F766E', display: 'flex' }} />
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>Fichadent</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>Historia clínica y agenda</span>
          <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: -3, lineHeight: 1, color: '#0F766E' }}>para tu consultorio dental.</span>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 28, fontWeight: 700 }}>
          <span style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '14px 26px' }}>Prueba gratis 5 días</span>
          <span style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '14px 26px' }}>Hecho en Perú</span>
        </div>
      </div>
    ),
    size,
  );
}
