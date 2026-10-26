import '@fontsource-variable/inter';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: true, follow: true } };

/** Webs públicas de consultorios: sin la navegación de Fichadent, con la marca de cada consultorio. */
export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return <div className="font-apple min-h-dvh text-[#1D1D1F]">{children}</div>;
}
