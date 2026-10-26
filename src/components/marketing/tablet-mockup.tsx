/**
 * Tablet con la pantalla de Inicio (diseño 1A), dibujada con HTML para que pese poco y se vea nítida.
 * Decorativa: el texto real de la sección está fuera; aquí todo es aria-hidden.
 */
const MINI = [
  { ini: 'RQ', name: 'Rosa Quispe', alert: 'Penicilina', from: '#34C3B4', to: 'var(--color-brand-700)' },
  { ini: 'LM', name: 'Luis Mamani', alert: '3 alertas', from: '#F5B041', to: '#A86A0C' },
  { ini: 'PH', name: 'Pedro Huanca', alert: 'Anticoag.', from: '#6FB1FF', to: '#2F6FD6' },
];
const TODAY = [
  { t: '09:00 Rosa', dot: '#15803D' },
  { t: '10:30 Juan', dot: '#15803D' },
  { t: '16:00 María', dot: '#1D4ED8', next: true },
  { t: '17:00 Luis', dot: '#55555A' },
];

export function TabletMockup() {
  return (
    <div aria-hidden className="ml-auto aspect-[1180/820] w-full max-w-[640px] rounded-[40px] bg-[#1D1D1F] p-3 shadow-[0_40px_80px_rgba(20,40,60,0.28),inset_0_1px_0_rgba(255,255,255,0.2)]">
      <div className="marketing-backdrop relative flex size-full flex-col gap-[4%] overflow-hidden rounded-[30px] px-[5%] pt-[5%]">
        <div className="flex items-start justify-between">
          <div>
            <span className="block text-[10px] font-semibold text-ink-muted">Lunes 26 de octubre · Consultorio Dental Sonrisa</span>
            <span className="block text-[clamp(18px,2.4vw,30px)] leading-none font-extrabold tracking-[-0.05em]">
              Buenas tardes,
              <br />
              <span className="text-brand-700">Lucía.</span>
            </span>
          </div>
          <span className="flex h-[26px] items-center gap-1 rounded-full bg-white/70 px-2.5 text-[9px] font-bold text-[#1F7A3A]">
            <span className="size-1.5 rounded-full bg-[#34C759]" />
            En línea
          </span>
        </div>
        <div className="flex gap-[3%]">
          <div className="glass-lens flex flex-[0_0_42%] justify-between rounded-[18px] px-3 py-2.5">
            <div>
              <span className="block text-[8px] font-bold tracking-[0.08em] opacity-85">AHORA · 16:00 CONTROL</span>
              <span className="mt-0.5 block text-xs font-bold">María Ccama</span>
              <span className="mt-1 inline-block rounded-full bg-alert-50 px-1.5 py-0.5 text-[8px] font-bold text-alert">Embarazo</span>
            </div>
            <span className="text-[26px] leading-none font-extrabold tracking-[-0.06em]">
              20<span className="text-[9px] font-semibold tracking-normal"> min</span>
            </span>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-[5px] rounded-[18px] bg-white/55 p-2">
            {TODAY.map((c) => (
              <span
                key={c.t}
                className={`flex items-center gap-1 rounded-full px-1.5 py-1 text-[8.5px] ${c.next ? 'bg-white font-bold ring-[1.5px] ring-brand-700' : 'bg-white/60 font-semibold'}`}
              >
                <span className="size-[5px] rounded-full" style={{ background: c.dot }} />
                {c.t}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[3%]">
          {MINI.map((m) => (
            <div key={m.ini} className="flex flex-col gap-1.5 rounded-2xl bg-white/60 p-2 shadow-[inset_0_1px_0_#fff]">
              <div className="flex items-center gap-1.5">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                  style={{ background: `linear-gradient(160deg, ${m.from}, ${m.to})` }}
                >
                  {m.ini}
                </span>
                <span className="truncate text-[9.5px] font-bold">{m.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-alert-50 px-1.5 py-0.5 text-[7.5px] font-bold text-alert">{m.alert}</span>
                <span className="size-[18px] rounded-full bg-whatsapp" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-[5%] bottom-[4%] flex h-[30px] gap-1.5">
          <span className="w-[110px] rounded-full bg-white/85 shadow-[0_6px_14px_rgba(20,40,60,0.15)]" />
          <span className="flex flex-1 items-center rounded-full bg-white/85 pl-3 text-[9px] text-ink-muted shadow-[0_6px_14px_rgba(20,40,60,0.15)]">
            Buscar por nombre, DNI o celular
          </span>
          <span className="w-[30px] rounded-full bg-brand-700" />
        </div>
      </div>
    </div>
  );
}
