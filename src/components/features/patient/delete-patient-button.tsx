'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { deletePatient } from '@/lib/actions/patients';

/**
 * Eliminar paciente con confirmación. Deja de aparecer en listas, buscador y agenda;
 * su historia clínica se conserva en la base (no se borra físicamente).
 */
export function DeletePatientButton({
  patientId,
  name,
  redirectTo = '/pacientes',
  compact,
}: {
  patientId: string;
  name: string;
  redirectTo?: string | null;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  return (
    <>
      <Button
        variant="ghost"
        size={compact ? 'icon' : 'sm'}
        aria-label={compact ? `Eliminar a ${name}` : undefined}
        className="text-alert hover:text-alert"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-[18px]" aria-hidden />
        {compact ? null : 'Eliminar paciente'}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        tone="danger"
        loading={pending}
        title="¿Eliminar paciente?"
        description={`${name} dejará de aparecer en tus pacientes, el buscador y la agenda. Sus citas futuras se cancelan.`}
        confirmLabel="Eliminar"
        onConfirm={() =>
          startTransition(async () => {
            const res = await deletePatient(patientId);
            if (!res.ok) {
              toast({ title: 'No se pudo eliminar', description: res.error, tone: 'error' });
              return;
            }
            setOpen(false);
            toast({ title: 'Paciente eliminado', description: name });
            if (redirectTo) router.replace(redirectTo);
            router.refresh();
          })
        }
      />
    </>
  );
}
