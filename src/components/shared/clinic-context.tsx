'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ClinicSession } from '@/types/domain';

export type { ClinicSession };

const ClinicContext = createContext<ClinicSession | null>(null);

/** Usuario y consultorio logueados (rutas de Storage, marca, mensajes de WhatsApp). */
export function ClinicProvider({ value, children }: { value: ClinicSession; children: ReactNode }) {
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicSession {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic debe usarse dentro de <ClinicProvider>');
  return ctx;
}
