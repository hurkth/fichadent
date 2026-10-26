'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Copy, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { saveClinicSite } from '@/lib/actions/site';
import { slugify, type ClinicSiteValues } from '@/lib/schemas/site';
import type { ClinicSession } from '@/types/domain';

type Form = { [K in keyof ClinicSiteValues]: ClinicSiteValues[K] extends boolean ? boolean : string };

/**
 * Ajustes › Mi web: la página pública del consultorio (/consultorio/<dirección>).
 * Usa el nombre, logo, color, celular, dirección y precios que ya están en Fichadent.
 */
export function ClinicSiteForm({ session, site, siteUrl }: { session: ClinicSession; site: ClinicSiteValues | null; siteUrl: string }) {
  const router = useRouter();
  const toast = useToast();
  const { clinic } = session;
  const [savedSlug, setSavedSlug] = useState(site?.slug ?? null);
  const [f, setF] = useState<Form>({
    slug: site?.slug ?? slugify(clinic.name),
    published: site?.published ?? false,
    headline: site?.headline ?? '',
    about: site?.about ?? '',
    hours: site?.hours ?? '',
    city: site?.city ?? '',
    maps_url: site?.maps_url ?? '',
    show_prices: site?.show_prices ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const publicUrl = `${siteUrl}/consultorio/${f.slug || '…'}`;
  const livePath = savedSlug ? `/consultorio/${savedSlug}` : null;

  const save = async () => {
    setSaving(true);
    const res = await saveClinicSite(f, savedSlug);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return toast({ title: res.error, tone: 'error' });
    }
    setErrors({});
    setSavedSlug(res.data.slug);
    toast({ title: f.published ? 'Tu web está publicada' : 'Guardado · tu web aún no es pública' });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-5 pb-28 md:max-w-[860px] md:px-10">
      <Card as="section" className="flex flex-col gap-4 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Globe className="size-[22px]" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-lg font-extrabold">Tu página web</h2>
            <p className="m-0 text-[15px] leading-snug font-semibold text-ink-muted">
              Una página para que tus pacientes te encuentren en Google y te escriban por WhatsApp. Usa tu nombre, logo, color, celular, dirección y
              tus precios de Ajustes.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white/70 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold">{f.published ? 'Publicada' : 'Sin publicar'}</span>
            <span className="text-[13px] font-semibold text-ink-muted">{f.published ? 'Cualquiera puede verla y Google la encuentra.' : 'Solo tú la puedes preparar.'}</span>
          </div>
          <Switch checked={f.published} onChange={(v) => set('published', v)} label="Publicar mi web" onLabel="Sí" offLabel="No" />
        </div>
        {livePath && site?.published ? (
          <div className="flex flex-wrap gap-2">
            <a href={livePath} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/85 px-5 text-[15px] font-bold text-ink no-underline shadow-[inset_0_1px_0_#fff]">
              <ExternalLink className="size-5" aria-hidden />
              Ver mi web
            </a>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigator.clipboard?.writeText(`${siteUrl}${livePath}`);
                toast({ title: 'Enlace copiado' });
              }}
            >
              <Copy className="size-5" aria-hidden />
              Copiar enlace
            </Button>
          </div>
        ) : null}
      </Card>

      <Card as="section" className="flex flex-col gap-5 p-5 md:p-6">
        <h2 className="m-0 text-lg font-extrabold">Dirección de tu web</h2>
        <Field label="Dirección" htmlFor="site-slug" error={errors.slug} hint={<span className="break-all text-ink-muted">{publicUrl}</span>}>
          <Input id="site-slug" prefix="/consultorio/" value={f.slug} invalid={!!errors.slug} onChange={(e) => set('slug', slugify(e.target.value) || e.target.value.toLowerCase())} />
        </Field>
      </Card>

      <Card as="section" className="flex flex-col gap-5 p-5 md:p-6">
        <h2 className="m-0 text-lg font-extrabold">Lo que dice tu web</h2>
        <Field label="Frase principal" htmlFor="site-headline" error={errors.headline} hint={<span className="text-ink-muted">Ej. «Tu sonrisa en buenas manos en Puno»</span>}>
          <Input id="site-headline" value={f.headline} placeholder={`Odontología para toda la familia`} onChange={(e) => set('headline', e.target.value)} />
        </Field>
        <Field label="Sobre el consultorio" htmlFor="site-about" error={errors.about}>
          <Textarea id="site-about" rows={4} value={f.about} placeholder="Quiénes somos, cómo atendemos, años de experiencia…" onChange={(e) => set('about', e.target.value)} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Horario de atención" htmlFor="site-hours" error={errors.hours}>
            <Textarea id="site-hours" rows={3} value={f.hours} placeholder={'Lun a vie: 9:00 a 13:00 y 15:00 a 20:00\nSáb: 9:00 a 13:00'} onChange={(e) => set('hours', e.target.value)} />
          </Field>
          <div className="flex flex-col gap-5">
            <Field label="Ciudad" htmlFor="site-city" error={errors.city} hint={<span className="text-ink-muted">Ayuda a que te encuentren: «dentista en Puno»</span>}>
              <Input id="site-city" value={f.city} placeholder="Puno" onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="Enlace de Google Maps" htmlFor="site-maps" error={errors.maps_url}>
              <Input id="site-maps" inputMode="url" value={f.maps_url} placeholder="https://maps.app.goo.gl/…" onChange={(e) => set('maps_url', e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-base font-bold">Mostrar precios</span>
            <span className="text-[13px] font-semibold text-ink-muted">Los de Ajustes › Precios. Las intervenciones ocultas no se muestran.</span>
          </div>
          <Switch checked={f.show_prices} onChange={(v) => set('show_prices', v)} label="Mostrar precios en mi web" />
        </div>
      </Card>

      <div className="sticky bottom-28 z-10 flex justify-end md:bottom-[112px]">
        <Button size="lg" loading={saving} onClick={save} className="w-full md:w-auto md:min-w-[260px]">
          {saving ? null : <Check className="size-5" aria-hidden />}
          Guardar mi web
        </Button>
      </div>
    </div>
  );
}
