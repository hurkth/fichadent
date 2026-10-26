'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { CalendarClock, ClipboardPlus, FileText, MessageCircle, Phone, Trash2, UserPlus, X } from 'lucide-react';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useClinic } from '@/components/shared/clinic-context';
import { deleteAppointment, setAppointmentStatus } from '@/lib/actions/appointments';
import { durationMinutes, limaDate, limaTime, longDay, reminderMessage } from '@/lib/agenda';
import { cn } from '@/lib/cn';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import { telUrl, whatsappUrl } from '@/lib/contact';
import { formatPhone } from '@/lib/format';
import type { AgendaItem, AppointmentStatus } from '@/types/domain';

const STATUS_ORDER: AppointmentStatus[] = ['scheduled', 'confirmed', 'done', 'no_show', 'cancelled'];

export interface AppointmentDetailProps {
  appointment: AgendaItem;
  onEdit: () => void;
  onClose?: () => void;
  className?: string;
}

/** Panel de la cita: estado, WhatsApp con mensaje listo, ficha, visita, reprogramar. */
export function AppointmentDetail({ appointment: a, onEdit, onClose, className }: AppointmentDetailProps) {
  const { clinic } = useClinic();
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(a.status);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState(() => reminderMessage({ name: a.name, clinicName: clinic.name, startsAt: a.starts_at }));

  useEffect(() => {
    setStatus(a.status);
    setMessage(reminderMessage({ name: a.name, clinicName: clinic.name, startsAt: a.starts_at }));
  }, [a, clinic.name]);

  const changeStatus = (next: AppointmentStatus) => {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const res = await setAppointmentStatus(a.id, next);
      if (!res.ok) {
        setStatus(prev);
        toast({ title: res.error, tone: 'error' });
        return;
      }
      router.refresh();
    });
  };

  const remove = () =>
    startTransition(async () => {
      const res = await deleteAppointment(a.id);
      if (!res.ok) return toast({ title: res.error, tone: 'error' });
      setConfirmDelete(false);
      toast({ title: 'Cita quitada de la agenda' });
      onClose?.();
      router.refresh();
    });

  const start = limaTime(a.starts_at);
  const end = limaTime(a.ends_at);
  const date = limaDate(a.starts_at);
  const minutes = durationMinutes(a.starts_at, a.ends_at);
  const newPatientHref = `/pacientes/nuevo?nombre=${encodeURIComponent(a.name)}${a.phone ? `&celular=${a.phone}` : ''}&cita=${a.id}`;

  return (
    <article className={cn('flex flex-col gap-4 rounded-[20px] border border-line-card bg-surface p-5 md:p-6', className)}>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm font-bold text-ink-muted">
            {longDay(date).replace(/^./, (c) => c.toUpperCase())} · {start} – {end} ({minutes} min){a.reason ? ` · ${a.reason}` : ''}
          </span>
          <h2 className="m-0 text-[22px] leading-tight font-extrabold">{a.name}</h2>
          <span className="text-[15px] font-semibold text-ink-muted">
            {a.record_number ? a.record_number : 'Sin ficha'}
            {a.phone ? ` · ${formatPhone(a.phone)}` : ''}
          </span>
        </div>
        {onClose ? (
          <Button variant="ghost" size="icon" aria-label="Cerrar detalle" onClick={onClose}>
            <X className="size-6" aria-hidden />
          </Button>
        ) : null}
      </div>

      {a.notes ? <p className="m-0 rounded-xl bg-bg px-3.5 py-2.5 text-[15px] leading-snug font-medium">{a.notes}</p> : null}

      <div className="flex flex-col gap-2.5">
        <span className="field-label">Estado de la cita</span>
        <div role="radiogroup" aria-label="Estado de la cita" className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => {
            const on = s === status;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={pending}
                onClick={() => changeStatus(s)}
                className={cn(
                  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-3.5 text-sm transition-colors',
                  on ? cn('border-ink font-extrabold', APPOINTMENT_STATUS[s].className) : 'border-line bg-surface font-semibold text-ink-muted',
                )}
              >
                <span aria-hidden className={cn('size-2 rounded-full', APPOINTMENT_STATUS[s].dot)} />
                {APPOINTMENT_STATUS[s].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor={`wa-${a.id}`} className="field-label">
          Mensaje por WhatsApp
        </label>
        <Textarea
          id={`wa-${a.id}`}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-transparent bg-ok-50 text-[15px] font-medium"
        />
        <div className="flex gap-2.5">
          <ButtonAnchor
            variant="whatsapp"
            className="flex-1"
            disabled={!a.phone}
            href={a.phone ? whatsappUrl(a.phone, message) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            title={a.phone ? undefined : 'Sin celular registrado'}
          >
            <MessageCircle className="size-5" aria-hidden />
            Escribir por WhatsApp
          </ButtonAnchor>
          <ButtonAnchor variant="secondary" size="icon" disabled={!a.phone} href={a.phone ? telUrl(a.phone) : undefined} aria-label={`Llamar a ${a.name}`}>
            <Phone className="size-5" aria-hidden />
          </ButtonAnchor>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 border-t border-line-soft pt-4">
        {a.patient_id ? (
          <>
            {a.visit_id ? (
              <ButtonLink href={`/pacientes/${a.patient_id}?tab=visitas`} variant="secondary">
                <FileText className="size-5" aria-hidden />
                Ver visita
              </ButtonLink>
            ) : (
              <ButtonLink href={`/pacientes/${a.patient_id}/visitas/nueva?cita=${a.id}`}>
                <ClipboardPlus className="size-5" aria-hidden />
                Atender
              </ButtonLink>
            )}
            <ButtonLink href={`/pacientes/${a.patient_id}`} variant="secondary">
              Ver ficha
            </ButtonLink>
          </>
        ) : (
          <ButtonLink href={newPatientHref} className="col-span-2">
            <UserPlus className="size-5" aria-hidden />
            Crear su ficha
          </ButtonLink>
        )}
        <Button variant="secondary" onClick={onEdit}>
          <CalendarClock className="size-5" aria-hidden />
          Reprogramar
        </Button>
        <Button variant="ghost" className="text-alert hover:text-alert" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="size-5" aria-hidden />
          Quitar
        </Button>
      </div>

      {a.patient_id ? null : (
        <p className="m-0 text-[13px] font-semibold text-ink-muted">
          Esta persona aún no tiene ficha. Al crearla, la cita queda enlazada.{' '}
          <Link href={newPatientHref} className="font-bold">
            Crear ficha
          </Link>
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={pending}
        tone="danger"
        title="¿Quitar la cita de la agenda?"
        description="Úsalo si la agendaste por error. Si el paciente avisó que no viene, mejor márcala como Cancelada."
        confirmLabel="Quitar"
      />
    </article>
  );
}
