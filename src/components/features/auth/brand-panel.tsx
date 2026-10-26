import { CalendarDays, MessageCircle, Search } from 'lucide-react';
import { LogoMark, PRODUCT_NAME } from '@/components/ui/logo';

const POINTS = [
  { icon: Search, text: 'Encuentra cualquier historia por nombre, DNI o celular.' },
  { icon: CalendarDays, text: 'Agenda del día y de la semana en un vistazo.' },
  { icon: MessageCircle, text: 'Escribe a tus pacientes por WhatsApp con un toque.' },
];

/** Panel izquierdo de login y registro (tablet). */
export function BrandPanel() {
  return (
    <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-brand-25 px-16 py-14 md:flex">
      <LogoMark size={560} className="absolute -right-[160px] -bottom-[180px] opacity-[.06]" />
      <span className="relative text-sm font-bold tracking-[.2em] text-ink-muted">HISTORIA CLÍNICA DENTAL</span>
      <div className="relative flex flex-col items-start gap-7">
        <LogoMark size={96} />
        <p className="m-0 max-w-[480px] text-[42px] leading-[1.1] font-extrabold tracking-[-.025em] text-balance">
          Tus pacientes y tu agenda, en un solo lugar.
        </p>
        <ul className="m-0 flex max-w-[440px] list-none flex-col gap-4 p-0">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-lg leading-snug font-semibold text-ink-muted">
              <Icon className="mt-0.5 size-6 shrink-0 text-brand-700" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <span className="relative text-sm font-semibold text-ink-muted">{PRODUCT_NAME} · Hecho en Perú</span>
    </section>
  );
}
