'use client';

import { UserPlus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { ClinicLogo } from '@/components/ui/logo';
import { useClinic } from '@/components/shared/clinic-context';
import { UserMenu } from '@/components/shared/user-menu';
import { formatWeekdayDate, greeting } from '@/lib/format';

/** Inicio: fecha + saludo + Nuevo paciente. En móvil, barra con el logo del consultorio. */
export function HomeHeader({ now = new Date() }: { now?: Date }) {
  const { clinic, displayName } = useClinic();
  return (
    <>
      <div className="flex items-center gap-3 md:hidden">
        <ClinicLogo url={clinic.logoUrl} name={clinic.name} size={44} />
        <span className="min-w-0 flex-1 truncate text-lg font-extrabold">{clinic.name}</span>
        <UserMenu size="sm" />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="hidden text-[15px] font-semibold text-ink-muted md:block">
            {formatWeekdayDate(now)} · {clinic.name}
          </span>
          <h1 className="m-0 text-[26px] font-extrabold tracking-[-.02em] md:text-[28px]">
            <span className="md:hidden">Pacientes</span>
            <span className="hidden md:inline">
              {greeting(now)}, {displayName}
            </span>
          </h1>
        </div>
        <ButtonLink href="/pacientes/nuevo" className="hidden md:inline-flex">
          <UserPlus className="size-[22px]" aria-hidden />
          Nuevo paciente
        </ButtonLink>
      </div>
    </>
  );
}
