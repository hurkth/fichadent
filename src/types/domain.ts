import type { Database } from './database';

type Tables = Database['public']['Tables'];

export type Patient = Tables['patients']['Row'];
export type Visit = Tables['visits']['Row'];
export type Treatment = Tables['treatments']['Row'];
export type Service = Tables['services']['Row'];
export type Condition = Tables['conditions']['Row'];
export type PatientFile = Tables['files']['Row'];

export type TreatmentStatus = Treatment['status'];
export type AppointmentStatus = Tables['appointments']['Row']['status'];
export type FileKind = PatientFile['kind'];
export type MaritalStatus = NonNullable<Patient['marital_status']>;

/** Lo que devuelven las RPC search_patients y recent_patients. */
export interface PatientCard {
  id: string;
  record_number: string;
  legacy_record_number: string | null;
  first_names: string;
  last_names: string;
  dni: string | null;
  phone: string | null;
  age: number | null;
  alerts: string[];
  last_visit: string | null;
}

/** Antecedente del catálogo con el estado del paciente. */
export interface PatientCondition {
  conditionId: string;
  code: string;
  label: string;
  active: boolean;
  detail: string | null;
  updatedAt: string | null;
}

export interface TreatmentWithService extends Treatment {
  service: Pick<Service, 'id' | 'name'>;
}

export interface VisitWithTreatments extends Visit {
  treatments: TreatmentWithService[];
}

export interface FileWithUrl extends PatientFile {
  url: string | null;
}

/** Tratamiento en edición dentro de Nueva visita (aún no guardado). */
export interface DraftTreatment {
  key: string;
  serviceId: string;
  serviceName: string;
  teeth: string[];
  wholeMouth: boolean;
  status: TreatmentStatus;
  notes?: string;
  /** Precio por pieza (o por el tratamiento si es boca completa). null = sin precio. */
  price: number | null;
}

/** Resultado estándar de las Server Actions. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ClinicPlan = Database['public']['Tables']['clinics']['Row']['plan'];

/** Usuario logueado + su consultorio. Lo arma getSession() desde rpc('my_session'). */
export interface ClinicSession {
  userId: string;
  displayName: string;
  role: 'owner' | 'dentist' | 'assistant';
  email: string;
  /** Administrador de Fichadent: puede editar la landing (/admin/landing). */
  isPlatformAdmin?: boolean;
  clinic: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    logoPath: string | null;
    /** URL firmada (1 h) del logo, o null → "Tu logo aquí". */
    logoUrl: string | null;
    brandColor: string;
    plan: ClinicPlan;
    trialEndsAt: string;
    trialDaysLeft: number;
  };
}

export type Appointment = Tables['appointments']['Row'];

/** Lo que devuelve rpc('agenda'). */
export interface AgendaItem {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  patient_id: string | null;
  name: string;
  phone: string | null;
  record_number: string | null;
  visit_id: string | null;
}
