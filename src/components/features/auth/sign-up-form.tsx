'use client';

import { useActionState } from 'react';
import { CircleAlert, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signUp, type SignUpState } from '@/lib/actions/auth';
import { PasswordInput } from './password-input';

/** Registro: nombre, consultorio, celular, correo y contraseña. */
export function SignUpForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, {});
  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};

  if (state.confirmEmail) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-[20px] bg-brand-50 p-6 text-brand-900">
        <MailCheck className="size-8" aria-hidden />
        <p className="m-0 text-xl font-extrabold">Revisa tu correo</p>
        <p className="m-0 text-base leading-relaxed font-semibold">
          Te enviamos un enlace a <strong>{state.confirmEmail}</strong>. Ábrelo para activar tu cuenta y entrar a tu consultorio.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <p role="alert" className="m-0 flex items-center gap-2 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
          <CircleAlert className="size-5 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      <Field label="Tu nombre" htmlFor="full_name" required error={fe.full_name}>
        <Input id="full_name" name="full_name" defaultValue={v.full_name} autoComplete="name" placeholder="Dra. Ana Quispe" invalid={!!fe.full_name} />
      </Field>
      <Field label="Nombre del consultorio" htmlFor="clinic_name" required error={fe.clinic_name}>
        <Input id="clinic_name" name="clinic_name" defaultValue={v.clinic_name} autoComplete="organization" placeholder="Consultorio Dental Sonrisa" invalid={!!fe.clinic_name} />
      </Field>
      <Field label="Celular" htmlFor="phone" required error={fe.phone}>
        <Input id="phone" name="phone" defaultValue={v.phone} inputMode="tel" autoComplete="tel-national" prefix="+51" placeholder="987 654 321" invalid={!!fe.phone} />
      </Field>
      <Field label="Correo electrónico" htmlFor="email" required error={fe.email}>
        <Input id="email" name="email" type="email" defaultValue={v.email} autoComplete="email" placeholder="tucorreo@gmail.com" invalid={!!fe.email} />
      </Field>
      <Field label="Contraseña (mínimo 8)" htmlFor="password" required error={fe.password}>
        <PasswordInput id="password" name="password" autoComplete="new-password" />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
        Crear mi cuenta gratis
      </Button>
      <p className="m-0 text-center text-[13px] font-semibold text-ink-subtle">
        Tus datos y los de tus pacientes solo los ves tú.
      </p>
    </form>
  );
}
