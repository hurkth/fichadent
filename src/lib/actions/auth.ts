'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { REMEMBER_COOKIE, SESSION_COOKIE } from '@/lib/supabase/middleware';
import { signUpSchema } from '@/lib/schemas/clinic';
import { fieldErrors } from './errors';

export interface LoginState {
  error?: string;
}

/** F01 · Inicia sesión y aplica "Mantener la sesión iniciada en esta tablet". */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const remember = formData.get('remember') === 'on';

  if (!email || !password) return { error: 'Ingresa tu correo y contraseña.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    console.error('[login]', error?.code, error?.message);
    if (error?.code === 'email_not_confirmed') {
      return { error: 'El correo aún no está confirmado. En Supabase > Authentication > Users, confírmalo.' };
    }
    if (error?.code === 'invalid_credentials' || error?.status === 400) {
      return { error: 'Correo o contraseña incorrectos.' };
    }
    return { error: 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.' };
  }
  // El consultorio activo lo valida el layout de la app:
  // si falta, redirige a /auth/signout → /login?error=sin-acceso.
  await setSessionCookies(remember);
  redirect('/');
}

/** Cookies de "mantener la sesión". `secure` solo en HTTPS (en http://localhost se descartaría). */
async function setSessionCookies(remember: boolean) {
  const proto = (await headers()).get('x-forwarded-proto') ?? 'http';
  const store = await cookies();
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: proto === 'https', path: '/' };
  store.set(SESSION_COOKIE, '1', base);
  if (remember) store.set(REMEMBER_COOKIE, '1', { ...base, maxAge: 60 * 60 * 24 * 30 });
  else store.delete(REMEMBER_COOKIE);
}

export interface SignUpState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Supabase pide confirmar el correo antes de entrar. */
  confirmEmail?: string;
  values?: Record<string, string>;
}

/** Autoregistro: crea el usuario; la base crea su consultorio con 5 días de prueba. */
export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const raw = {
    full_name: String(formData.get('full_name') ?? ''),
    clinic_name: String(formData.get('clinic_name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };
  const values = { ...raw, password: '' };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error), values };
  const { email, password, ...meta } = parsed.data;

  const origin = (await headers()).get('origin') ?? '';
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: meta, emailRedirectTo: `${origin}/auth/callback?next=/` },
  });

  if (error) {
    console.error('[signUp]', error.code, error.message);
    if (error.code === 'user_already_exists' || error.code === 'email_exists') {
      return { error: 'Ya existe una cuenta con ese correo. Inicia sesión.', values };
    }
    if (error.code === 'weak_password') return { fieldErrors: { password: 'Contraseña muy débil. Usa letras y números.' }, error: 'Revisa la contraseña.', values };
    if (error.code === 'over_email_send_rate_limit') return { error: 'Demasiados registros seguidos. Inténtalo en unos minutos.', values };
    return { error: 'No pudimos crear tu cuenta. Inténtalo otra vez.', values };
  }

  // Supabase devuelve un usuario sin identidades cuando el correo ya existe (protección anti-enumeración).
  if (data.user && data.user.identities?.length === 0) {
    return { error: 'Ya existe una cuenta con ese correo. Inicia sesión.', values };
  }
  if (!data.session) return { confirmEmail: email };

  await setSessionCookies(true);
  redirect('/?bienvenida=1');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REMEMBER_COOKIE);
  redirect('/login');
}

export interface ResetState {
  sent?: boolean;
  error?: string;
}

/** Envía el correo de recuperación. No revela si el correo existe. */
export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ingresa un correo válido.' };

  const origin = (await headers()).get('origin') ?? '';
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password/nueva`,
  });
  return { sent: true };
}

/** Define la nueva contraseña (sesión creada por /auth/callback). */
export async function updatePassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };
  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'El enlace expiró. Pide uno nuevo.' };

  const store = await cookies();
  store.set(SESSION_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/' });
  redirect('/');
}
