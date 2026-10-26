import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/features/auth/login-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

const ERRORS: Record<string, string> = {
  'sin-acceso': 'Tu cuenta no tiene un consultorio activo. Escríbenos para ayudarte.',
  'enlace-invalido': 'El enlace expiró o no es válido. Pide uno nuevo.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Iniciar sesión</h1>
        <p className="m-0 text-base font-medium text-ink-muted">Ingresa con tu cuenta de Fichadent.</p>
      </div>
      <LoginForm initialError={error ? ERRORS[error] : undefined} />
      <p className="m-0 text-center text-base font-semibold text-ink-muted">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="font-extrabold">
          Prueba gratis 5 días
        </Link>
      </p>
    </>
  );
}
