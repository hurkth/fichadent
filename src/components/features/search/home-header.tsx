'use client';

import { ClinicLogo } from '@/components/ui/logo';
import { useClinic } from '@/components/shared/clinic-context';
import { TopCluster } from '@/components/shared/top-cluster';
import { TrialChip } from '@/components/shared/trial-banner';
import { UserMenu } from '@/components/shared/user-menu';
import { formatWeekdayDate, greeting } from '@/lib/format';
import { firstName } from '@/lib/greeting';

/** Inicio 1A: fecha + saludo gigante con el nombre en color de marca + cápsula superior. */
export function HomeHeader({ now = new Date() }: { now?: Date }) {
  const { clinic, displayName } = useClinic();
  return (
    <>
      <div className="flex items-center gap-3 md:hidden">
        <ClinicLogo url={clinic.logoUrl} name={clinic.name} size={40} className="rounded-full" />
        <span className="min-w-0 flex-1 truncate text-base font-bold">{clinic.name}</span>
        <TrialChip compact className="glass-float px-3" />
        <UserMenu size="sm" />
      </div>
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="hidden text-[15px] font-semibold text-ink-muted md:block">
            {formatWeekdayDate(now)} · {clinic.name}
          </span>
          <h1 className="m-0 text-[40px] leading-[0.98] font-extrabold tracking-[-0.055em] md:text-[58px]">
            {greeting(now)},
            <br />
            <span className="text-brand-700">{firstName(displayName)}.</span>
          </h1>
        </div>
        <TopCluster className="hidden shrink-0 md:flex" />
      </div>
    </>
  );
}
