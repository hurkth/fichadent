'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Check, ImageUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { ClinicLogo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/toast';
import { setClinicLogo, updateClinicSettings } from '@/lib/actions/clinic';
import { cn } from '@/lib/cn';
import { BRAND_COLORS, STORAGE_BUCKET } from '@/lib/constants';
import { compressImage } from '@/lib/images';
import type { ClinicSettingsValues } from '@/lib/schemas/clinic';
import { createClient } from '@/lib/supabase/client';
import type { ClinicSession } from '@/types/domain';

export function ClinicSettingsForm({ session }: { session: ClinicSession }) {
  const { clinic } = session;
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);

  const { register, handleSubmit, watch, setValue, getValues } = useForm<ClinicSettingsValues>({
    defaultValues: {
      name: clinic.name,
      display_name: session.displayName,
      phone: clinic.phone ?? '',
      address: clinic.address ?? '',
      brand_color: BRAND_COLORS.some((c) => c.value === clinic.brandColor) ? clinic.brandColor : BRAND_COLORS[0]!.value,
    },
  });
  const color = watch('brand_color');

  const onSubmit = handleSubmit(async () => {
    setSaving(true);
    const res = await updateClinicSettings(getValues());
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast({ title: res.error, tone: 'error' });
      return;
    }
    setErrors({});
    toast({ title: 'Ajustes guardados' });
    router.refresh();
  });

  const onLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLogoBusy(true);
    try {
      const blob = await compressImage(file, { maxSide: 512, quality: 0.9 });
      const path = `${clinic.id}/logo/logo-${Date.now()}.webp`;
      const { error } = await createClient().storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: 'image/webp' });
      if (error) throw error;
      const res = await setClinicLogo(path);
      if (!res.ok) throw new Error(res.error);
      toast({ title: 'Logo actualizado' });
      router.refresh();
    } catch {
      toast({ title: 'No se pudo subir el logo. Usa una imagen JPG o PNG.', tone: 'error' });
    } finally {
      setLogoBusy(false);
    }
  };

  const removeLogo = async () => {
    setLogoBusy(true);
    const res = await setClinicLogo(null);
    setLogoBusy(false);
    if (!res.ok) return toast({ title: res.error, tone: 'error' });
    toast({ title: 'Logo quitado' });
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5 md:max-w-[760px] md:px-8 md:py-7">
      <Card className="flex flex-col gap-5 p-5 md:p-6">
        <h2 className="m-0 text-lg font-extrabold">Logo</h2>
        <div className="flex flex-wrap items-center gap-5">
          <ClinicLogo url={clinic.logoUrl} name={clinic.name} size={96} />
          <div className="flex flex-col gap-3">
            <p className="m-0 max-w-[360px] text-[15px] leading-snug font-semibold text-ink-muted">
              Se muestra en el menú. Usa una imagen cuadrada (JPG o PNG).
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="secondary" size="sm" loading={logoBusy} onClick={() => fileRef.current?.click()}>
                {logoBusy ? null : <ImageUp className="size-5" aria-hidden />}
                {clinic.logoUrl ? 'Cambiar logo' : 'Subir logo'}
              </Button>
              {clinic.logoUrl ? (
                <Button variant="ghost" size="sm" disabled={logoBusy} onClick={removeLogo}>
                  <Trash2 className="size-5" aria-hidden />
                  Quitar
                </Button>
              ) : null}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onLogo} />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-5 md:p-6">
        <h2 className="m-0 text-lg font-extrabold">Datos del consultorio</h2>
        <Field label="Nombre del consultorio" htmlFor="name" required error={errors.name}>
          <Input id="name" invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Tu nombre (como te saludamos)" htmlFor="display_name" required error={errors.display_name}>
          <Input id="display_name" placeholder="Dra. Ana Quispe" invalid={!!errors.display_name} {...register('display_name')} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Celular / WhatsApp del consultorio" htmlFor="phone" error={errors.phone}>
            <Input id="phone" inputMode="tel" prefix="+51" invalid={!!errors.phone} {...register('phone')} />
          </Field>
          <Field label="Dirección" htmlFor="address" error={errors.address}>
            <Textarea id="address" rows={1} placeholder="Jr. Lima 123, Puno" {...register('address')} />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5 md:p-6">
        <h2 className="m-0 text-lg font-extrabold">Color</h2>
        <div role="radiogroup" aria-label="Color del consultorio" className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((c) => {
            const on = c.value === color;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={c.label}
                title={c.label}
                onClick={() => setValue('brand_color', c.value, { shouldDirty: true })}
                className={cn(
                  'flex size-12 cursor-pointer items-center justify-center rounded-full border-[3px] text-white',
                  on ? 'border-ink' : 'border-transparent',
                )}
                style={{ background: c.value }}
              >
                {on ? <Check className="size-6" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
        {errors.brand_color ? <span className="text-[13px] font-bold text-alert">{errors.brand_color}</span> : null}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={saving} className="w-full md:w-auto md:min-w-[260px]">
          {saving ? null : <Check className="size-5" aria-hidden />}
          Guardar ajustes
        </Button>
      </div>
    </form>
  );
}
