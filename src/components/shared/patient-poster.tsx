import Link from 'next/link';
import { formatPhone, fullName, recordDigits } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { PatientCard } from '@/types/domain';
import { ContactActions } from './contact-actions';
import { MedicalAlerts } from './medical-alerts';
import { PatientAvatar } from './patient-identity';

/** "HC 00248 · 47 años · 951 284 736" */
function meta(p: PatientCard): string {
  return [`HC ${recordDigits(p.record_number)}`, p.age !== null ? `${p.age} años` : null, p.phone ? formatPhone(p.phone) : 'Sin celular']
    .filter(Boolean)
    .join(' · ');
}

/**
 * Póster de paciente (spec 03 §5.4): vidrio, avatar degradado, alertas en rojo y WhatsApp/Llamar.
 * "row": versión fila para resultados de búsqueda y listas.
 */
export function PatientPoster({ patient, variant = 'poster', extra }: { patient: PatientCard; variant?: 'poster' | 'row'; extra?: React.ReactNode }) {
  const name = fullName(patient);
  const href = `/pacientes/${patient.id}`;

  if (variant === 'row') {
    return (
      <article className="flex min-h-[72px] items-center gap-3 rounded-[24px] px-2 py-2 hover:bg-white/60">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 text-ink no-underline">
          <PatientAvatar patient={patient} size="md" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-base font-bold">{name}</span>
            <span className="flex min-w-0 items-center gap-1.5">
              {patient.alerts.length ? <MedicalAlerts alerts={patient.alerts} compact size="sm" className="shrink-0" /> : null}
              <span className="truncate text-[13px] text-ink-muted tabular">{meta(patient)}</span>
            </span>
          </span>
        </Link>
        <ContactActions phone={patient.phone} name={name} variant="round" />
        {extra}
      </article>
    );
  }

  return (
    <article className="glass relative flex h-[150px] flex-col justify-between rounded-[32px] p-4">
      <Link href={href} className="flex min-w-0 items-center gap-3 text-ink no-underline after:absolute after:inset-0 after:rounded-[32px] after:content-['']">
        <PatientAvatar patient={patient} size="poster" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-base leading-tight font-bold">{name}</span>
          <span className="truncate text-[12.5px] text-ink-muted tabular">{meta(patient)}</span>
        </span>
      </Link>
      <div className="relative z-10 flex items-center gap-2">
        {patient.alerts.length ? <MedicalAlerts alerts={patient.alerts} compact size="sm" className="min-w-0" /> : null}
        <span className="flex-1" />
        {patient.phone ? (
          <ContactActions phone={patient.phone} name={name} variant="round" />
        ) : (
          <span className={cn('flex h-12 items-center rounded-full bg-fill px-4 text-[12.5px] font-semibold text-ink-muted')}>Sin celular</span>
        )}
      </div>
    </article>
  );
}
