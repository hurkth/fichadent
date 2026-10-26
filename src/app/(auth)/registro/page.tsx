import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUpForm } from '@/components/features/auth/sign-up-form';

export const metadata: Metadata = { title: 'Prueba gratis' };

export default function SignUpPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-.02em]">Prueba gratis 5 días</h1>
        <p className="m-0 text-base font-medium text-ink-muted">Crea tu cuenta y empieza a cargar tus pacientes hoy. Sin tarjeta.</p>
      </div>
      <SignUpForm />
      <p className="m-0 text-center text-base font-semibold text-ink-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-extrabold">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
