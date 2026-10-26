'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, LoaderCircle, Search, UserPlus, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { PatientAvatar } from '@/components/shared/patient-identity';
import { usePatientSearch } from '@/hooks/use-patient-search';
import { createAppointment, updateAppointment } from '@/lib/actions/appointments';
import { DURATIONS, durationMinutes, limaDate, limaTime } from '@/lib/agenda';
import { formatPhone, fullName, nameInitials } from '@/lib/format';
import type { AppointmentFormValues } from '@/lib/schemas/appointment';
import type { AgendaItem } from '@/types/domain';

const REASONS = ['Evaluación', 'Control', 'Limpieza', 'Resina', 'Endodoncia', 'Extracción', 'Ortodoncia', 'Urgencia'];

export interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  /** Editar / reprogramar esta cita. Sin ella, crea una nueva. */
  appointment?: AgendaItem | null;
  /** Valores iniciales al crear (día/hora tocados en el calendario, paciente desde la ficha). */
  initial?: { date?: string; time?: string; patient?: { id: string; name: string; phone: string | null } };
  onSaved?: (id: string) => void;
}

type Picked = { id: string; name: string; phone: string | null } | null;

/** Nueva cita / Reprogramar: paciente (o nombre libre), fecha, hora, duración y motivo. */
export function AppointmentDialog({ open, onClose, appointment, initial, onSaved }: AppointmentDialogProps) {
  const router = useRouter();
  const toast = useToast();
  const editing = !!appointment;

  const [patient, setPatient] = useState<Picked>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [query, setQuery] = useState('');
  const [values, setValues] = useState({ guest_name: '', guest_phone: '', date: '', time: '', duration: 30, reason: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const search = usePatientSearch(guestMode || patient ? '' : query);

  // Reinicia el formulario cada vez que se abre.
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormError(null);
    setQuery('');
    if (appointment) {
      setPatient(appointment.patient_id ? { id: appointment.patient_id, name: appointment.name, phone: appointment.phone } : null);
      setGuestMode(!appointment.patient_id);
      setValues({
        guest_name: appointment.patient_id ? '' : appointment.name,
        guest_phone: appointment.patient_id ? '' : (appointment.phone ?? ''),
        date: limaDate(appointment.starts_at),
        time: limaTime(appointment.starts_at),
        duration: DURATIONS.includes(durationMinutes(appointment.starts_at, appointment.ends_at))
          ? durationMinutes(appointment.starts_at, appointment.ends_at)
          : 30,
        reason: appointment.reason ?? '',
        notes: appointment.notes ?? '',
      });
    } else {
      setPatient(initial?.patient ?? null);
      setGuestMode(false);
      setValues({ guest_name: '', guest_phone: '', date: initial?.date ?? '', time: initial?.time ?? '09:00', duration: 30, reason: '', notes: '' });
    }
  }, [open, appointment, initial]);

  const set = <K extends keyof typeof values>(key: K, v: (typeof values)[K]) => setValues((s) => ({ ...s, [key]: v }));

  const submit = async () => {
    setSaving(true);
    setFormError(null);
    const input: AppointmentFormValues = {
      patient_id: guestMode ? null : (patient?.id ?? null),
      guest_name: guestMode ? values.guest_name : '',
      guest_phone: guestMode ? values.guest_phone : '',
      date: values.date,
      time: values.time,
      duration: values.duration,
      reason: values.reason,
      notes: values.notes,
    };
    if (!guestMode && !patient) {
      setSaving(false);
      setErrors({ patient: 'Busca y elige un paciente, o agenda a alguien sin ficha.' });
      return;
    }
    const res = editing ? await updateAppointment(appointment!.id, input) : await createAppointment(input);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      setFormError(res.error);
      return;
    }
    toast({ title: editing ? 'Cita actualizada' : 'Cita agendada' });
    onSaved?.(editing ? appointment!.id : (res.data as { id: string }).id);
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Reprogramar cita' : 'Nueva cita'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={saving}>
            {saving ? null : <Check className="size-5" aria-hidden />}
            {editing ? 'Guardar cambios' : 'Agendar'}
          </Button>
        </>
      }
    >
      <div className="flex max-h-[62dvh] flex-col gap-5 overflow-y-auto pr-1">
        {formError ? (
          <p role="alert" className="m-0 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
            {formError}
          </p>
        ) : null}

        {/* Paciente */}
        {guestMode ? (
          <div className="flex flex-col gap-4 rounded-2xl bg-bg p-4">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[15px] font-extrabold">Persona sin ficha</span>
              {!editing || !appointment?.patient_id ? (
                <Button variant="ghost" size="sm" onClick={() => setGuestMode(false)}>
                  Buscar paciente
                </Button>
              ) : null}
            </div>
            <Field label="Nombre" htmlFor="guest_name" required error={errors.guest_name}>
              <Input id="guest_name" value={values.guest_name} onChange={(e) => set('guest_name', e.target.value)} invalid={!!errors.guest_name} />
            </Field>
            <Field label="Celular" htmlFor="guest_phone" error={errors.guest_phone}>
              <Input
                id="guest_phone"
                prefix="+51"
                inputMode="tel"
                className="tabular"
                value={formatPhone(values.guest_phone)}
                onChange={(e) => set('guest_phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                invalid={!!errors.guest_phone}
              />
            </Field>
          </div>
        ) : patient ? (
          <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-brand-700 bg-brand-25 p-3">
            <Avatar initials={nameInitials(patient.name)} size="md" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base font-extrabold">{patient.name}</span>
              <span className="text-sm font-semibold text-ink-muted">{patient.phone ? formatPhone(patient.phone) : 'Sin celular'}</span>
            </span>
            {!editing ? (
              <Button variant="ghost" size="icon" aria-label="Cambiar paciente" onClick={() => setPatient(null)}>
                <X className="size-5" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <Field label="Paciente" htmlFor="patient_q" required error={errors.patient}>
              <Input
                id="patient_q"
                autoComplete="off"
                placeholder="Nombre, DNI o celular"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefix={<Search className="size-5" aria-hidden />}
                suffix={search.loading ? <LoaderCircle className="mr-2 size-5 animate-spin text-ink-muted" aria-hidden /> : null}
              />
            </Field>
            {query.trim().length >= 2 && !search.loading && search.query === query.trim() ? (
              <ul className="m-0 flex max-h-56 list-none flex-col gap-1 overflow-y-auto p-0">
                {search.results.length === 0 ? (
                  <li className="px-1 py-2 text-[15px] font-semibold text-ink-muted">Sin resultados para “{query.trim()}”.</li>
                ) : (
                  search.results.slice(0, 8).map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setPatient({ id: p.id, name: fullName(p), phone: p.phone })}
                        className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-2 text-left hover:bg-bg"
                      >
                        <PatientAvatar patient={p} size="sm" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-base font-bold text-ink">{fullName(p)}</span>
                          <span className="text-[13px] font-semibold text-ink-muted">
                            {p.record_number}
                            {p.phone ? ` · ${formatPhone(p.phone)}` : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => {
                setGuestMode(true);
                if (query.trim() && !/\d/.test(query)) set('guest_name', query.trim());
                if (/^\d{9}$/.test(query.replace(/\D/g, ''))) set('guest_phone', query.replace(/\D/g, ''));
              }}
            >
              <UserPlus className="size-5" aria-hidden />
              Agendar a alguien sin ficha
            </Button>
          </div>
        )}

        {/* Cuándo */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha" htmlFor="date" required error={errors.date}>
            <Input id="date" type="date" className="tabular" value={values.date} onChange={(e) => set('date', e.target.value)} invalid={!!errors.date} />
          </Field>
          <Field label="Hora" htmlFor="time" required error={errors.time}>
            <Input id="time" type="time" step={300} className="tabular" value={values.time} onChange={(e) => set('time', e.target.value)} invalid={!!errors.time} />
          </Field>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="field-label">Duración</span>
          <div role="radiogroup" aria-label="Duración" className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <Chip key={d} role="radio" aria-checked={values.duration === d} selected={values.duration === d} size="sm" onClick={() => set('duration', d)}>
                {d < 60 ? `${d} min` : d % 60 === 0 ? `${d / 60} h` : `${Math.floor(d / 60)} h ${d % 60}`}
              </Chip>
            ))}
          </div>
        </div>

        {/* Motivo */}
        <div className="flex flex-col gap-2.5">
          <span className="field-label">Motivo</span>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <Chip key={r} size="sm" selected={values.reason === r} onClick={() => set('reason', values.reason === r ? '' : r)}>
                {r}
              </Chip>
            ))}
          </div>
          <Input aria-label="Motivo (otro)" placeholder="Otro motivo" value={REASONS.includes(values.reason) ? '' : values.reason} onChange={(e) => set('reason', e.target.value)} />
        </div>
        <Field label="Notas · opcional" htmlFor="notes">
          <Textarea id="notes" rows={2} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Dialog>
  );
}
