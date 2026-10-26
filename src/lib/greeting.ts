/** "Dra. Lucía Mamani" → "Lucía" (saludo de Inicio). */
export function firstName(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter((p) => !/^(dra?|dr|doctora?|lic|od)\.?$/i.test(p));
  return parts[0] ?? displayName.trim();
}

/** Minutos que faltan → "20 min" · "1 h 20" · "2 h". */
export function countdownLabel(minutes: number): { value: string; unit: string } {
  if (minutes <= 60) return { value: String(Math.max(0, Math.round(minutes))), unit: 'min' };
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? { value: `${h} h ${m}`, unit: 'para la cita' } : { value: `${h} h`, unit: 'para la cita' };
}
