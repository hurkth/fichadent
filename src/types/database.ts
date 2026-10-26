/**
 * Tipos de la base de datos (supabase/migrations/0001_fichadent.sql).
 *
 * Escritos a mano con el mismo formato que genera Supabase. Cuando tengas
 * acceso al proyecto, reemplázalos por los generados:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          address: string | null;
          logo_path: string | null;
          brand_color: string;
          plan: 'trial' | 'active' | 'demo' | 'suspended';
          trial_ends_at: string;
          record_seq: number;
        } & Timestamps;
        Insert: never;
        /** Solo estas columnas: plan y prueba no son editables desde la app. */
        Update: {
          name?: string;
          phone?: string | null;
          address?: string | null;
          logo_path?: string | null;
          brand_color?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          user_id: string;
          clinic_id: string;
          role: 'owner' | 'dentist' | 'assistant';
          display_name: string;
          active: boolean;
        } & Timestamps;
        Insert: never;
        Update: { display_name?: string };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          record_number: string;
          legacy_record_number: string | null;
          first_names: string;
          last_names: string;
          dni: string | null;
          birth_date: string | null;
          sex: 'F' | 'M' | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          occupation: string | null;
          marital_status: 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo' | null;
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          first_names: string;
          last_names: string;
          legacy_record_number?: string | null;
          dni?: string | null;
          birth_date?: string | null;
          sex?: 'F' | 'M' | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          occupation?: string | null;
          marital_status?: 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo' | null;
          notes?: string | null;
        };
        Update: {
          first_names?: string;
          last_names?: string;
          legacy_record_number?: string | null;
          dni?: string | null;
          birth_date?: string | null;
          sex?: 'F' | 'M' | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          occupation?: string | null;
          marital_status?: 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo' | null;
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      conditions: {
        Row: {
          id: string;
          clinic_id: string | null;
          code: string;
          label: string;
          needs_detail: boolean;
          is_alert: boolean;
          sort_order: number;
          active: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      patient_conditions: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          condition_id: string;
          detail: string | null;
          active: boolean;
        } & Timestamps;
        Insert: {
          patient_id: string;
          condition_id: string;
          detail?: string | null;
          active?: boolean;
        };
        Update: { detail?: string | null; active?: boolean };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          clinic_id: string | null;
          name: string;
          category: string;
          requires_tooth: boolean;
          default_price: number | null;
          sort_order: number;
          active: boolean;
        };
        /** Solo intervenciones propias del consultorio (0003). */
        Insert: {
          clinic_id: string;
          name: string;
          category: string;
          requires_tooth?: boolean;
          default_price?: number | null;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          name?: string;
          category?: string;
          requires_tooth?: boolean;
          default_price?: number | null;
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      /** Precio y visibilidad de cada servicio por consultorio (0003). */
      clinic_services: {
        Row: {
          clinic_id: string;
          service_id: string;
          price: number | null;
          hidden: boolean;
          updated_at: string;
        };
        Insert: {
          clinic_id?: string;
          service_id: string;
          price?: number | null;
          hidden?: boolean;
        };
        Update: {
          price?: number | null;
          hidden?: boolean;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          starts_at: string;
          ends_at: string;
          status: 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
          reason: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          patient_id?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          starts_at: string;
          ends_at: string;
          status?: 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
          reason?: string | null;
          notes?: string | null;
        };
        Update: {
          patient_id?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          starts_at?: string;
          ends_at?: string;
          status?: 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
          reason?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      visits: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          appointment_id: string | null;
          visit_date: string;
          reason: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          patient_id: string;
          appointment_id?: string | null;
          visit_date?: string;
          reason?: string | null;
          notes?: string | null;
        };
        Update: {
          visit_date?: string;
          reason?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      treatments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          visit_id: string;
          service_id: string;
          tooth: string | null;
          status: 'planned' | 'in_progress' | 'done';
          notes: string | null;
          /** Precio cobrado (0003). null = sin precio. */
          price: number | null;
          deleted_at: string | null;
          created_by: string | null;
        } & Timestamps;
        Insert: {
          patient_id: string;
          visit_id: string;
          service_id: string;
          tooth?: string | null;
          status?: 'planned' | 'in_progress' | 'done';
          notes?: string | null;
          price?: number | null;
        };
        Update: {
          tooth?: string | null;
          status?: 'planned' | 'in_progress' | 'done';
          notes?: string | null;
          price?: number | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      /** Textos editables de la landing de Fichadent (0004). */
      site_content: {
        Row: { key: string; value: Json; updated_at: string; updated_by: string | null };
        Insert: { key: string; value: Json };
        Update: { value?: Json };
        Relationships: [];
      };
      /** Web pública de cada consultorio (0004). */
      clinic_sites: {
        Row: {
          clinic_id: string;
          slug: string;
          published: boolean;
          headline: string | null;
          about: string | null;
          hours: string | null;
          city: string | null;
          maps_url: string | null;
          show_prices: boolean;
          updated_at: string;
        };
        Insert: {
          clinic_id?: string;
          slug: string;
          published?: boolean;
          headline?: string | null;
          about?: string | null;
          hours?: string | null;
          city?: string | null;
          maps_url?: string | null;
          show_prices?: boolean;
        };
        Update: {
          slug?: string;
          published?: boolean;
          headline?: string | null;
          about?: string | null;
          hours?: string | null;
          city?: string | null;
          maps_url?: string | null;
          show_prices?: boolean;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          visit_id: string | null;
          kind: 'paper_record' | 'xray' | 'photo' | 'consent' | 'other';
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          page_number: number | null;
          caption: string | null;
          taken_at: string | null;
          deleted_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          visit_id?: string | null;
          kind: 'paper_record' | 'xray' | 'photo' | 'consent' | 'other';
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          page_number?: number | null;
          caption?: string | null;
          taken_at?: string | null;
        };
        Update: { caption?: string | null; deleted_at?: string | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      search_patients: { Args: { q: string; max_results?: number }; Returns: Json[] };
      recent_patients: { Args: { max_results?: number }; Returns: Json[] };
      current_clinic_id: { Args: Record<PropertyKey, never>; Returns: string };
      my_session: { Args: Record<PropertyKey, never>; Returns: Json };
      list_patients: { Args: { page_size?: number; page?: number }; Returns: Json[] };
      delete_patient: { Args: { p_id: string }; Returns: undefined };
      agenda: { Args: { p_from: string; p_to: string }; Returns: Json[] };
      is_platform_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      public_clinic_site: { Args: { p_slug: string }; Returns: Json };
      public_clinic_slugs: { Args: Record<PropertyKey, never>; Returns: { slug: string; updated_at: string }[] };
      clinic_slug_available: { Args: { p_slug: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
