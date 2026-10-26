'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Check, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { saveLandingContent } from '@/lib/actions/landing';
import { parseSoles } from '@/lib/format';
import type { LandingContent } from '@/content/landing';

const toLines = (v: string) => v.split('\n').map((l) => l.trim()).filter(Boolean);

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card as="section" className="flex flex-col gap-5 p-5 md:p-6">
      <div>
        <h2 className="m-0 text-lg font-extrabold">{title}</h2>
        {hint ? <p className="m-0 mt-1 text-sm font-semibold text-ink-muted">{hint}</p> : null}
      </div>
      {children}
    </Card>
  );
}

/** Editor de la landing (/admin/landing). Todo el contenido en un solo objeto que se guarda junto. */
export function LandingEditor({ initial }: { initial: LandingContent }) {
  const router = useRouter();
  const toast = useToast();
  const [c, setC] = useState<LandingContent>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(c) !== JSON.stringify(initial);

  const set = <K extends keyof LandingContent>(key: K, value: LandingContent[K]) => setC((v) => ({ ...v, [key]: value }));
  const err = (path: string) => errors[path];

  const save = async () => {
    setSaving(true);
    const res = await saveLandingContent(c);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return toast({ title: res.error, tone: 'error' });
    }
    setErrors({});
    toast({ title: 'Landing publicada' });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-5 pb-28 md:max-w-[860px] md:px-10">
      <Section title="Google" hint="Título y descripción que aparecen en los resultados de búsqueda.">
        <Field label={`Título (${c.seo.title.length}/70)`} htmlFor="seo-title" error={err('seo.title')}>
          <Input id="seo-title" value={c.seo.title} onChange={(e) => set('seo', { ...c.seo, title: e.target.value })} />
        </Field>
        <Field label={`Descripción (${c.seo.description.length}/170)`} htmlFor="seo-desc" error={err('seo.description')}>
          <Textarea id="seo-desc" rows={3} value={c.seo.description} onChange={(e) => set('seo', { ...c.seo, description: e.target.value })} />
        </Field>
      </Section>

      <Section title="Portada" hint="El título se arma así: inicio + parte resaltada (en color) + final.">
        <Field label="Etiqueta superior" htmlFor="h-eyebrow" error={err('hero.eyebrow')}>
          <Input id="h-eyebrow" value={c.hero.eyebrow} onChange={(e) => set('hero', { ...c.hero, eyebrow: e.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Título · inicio" htmlFor="h-t1" error={err('hero.titleStart')}>
            <Input id="h-t1" value={c.hero.titleStart} onChange={(e) => set('hero', { ...c.hero, titleStart: e.target.value })} />
          </Field>
          <Field label="Título · resaltado" htmlFor="h-t2" error={err('hero.titleHighlight')}>
            <Input id="h-t2" value={c.hero.titleHighlight} onChange={(e) => set('hero', { ...c.hero, titleHighlight: e.target.value })} />
          </Field>
          <Field label="Título · final" htmlFor="h-t3" error={err('hero.titleEnd')}>
            <Input id="h-t3" value={c.hero.titleEnd} onChange={(e) => set('hero', { ...c.hero, titleEnd: e.target.value })} />
          </Field>
        </div>
        <Field label="Bajada" htmlFor="h-sub" error={err('hero.subtitle')}>
          <Textarea id="h-sub" rows={3} value={c.hero.subtitle} onChange={(e) => set('hero', { ...c.hero, subtitle: e.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Botón principal" htmlFor="h-cta1" error={err('hero.primaryCta')}>
            <Input id="h-cta1" value={c.hero.primaryCta} onChange={(e) => set('hero', { ...c.hero, primaryCta: e.target.value })} />
          </Field>
          <Field label="Botón secundario" htmlFor="h-cta2" error={err('hero.secondaryCta')}>
            <Input id="h-cta2" value={c.hero.secondaryCta} onChange={(e) => set('hero', { ...c.hero, secondaryCta: e.target.value })} />
          </Field>
        </div>
        <Field label="Checks bajo los botones (uno por línea, máx. 4)" htmlFor="h-checks">
          <Textarea id="h-checks" rows={3} defaultValue={c.hero.checks.join('\n')} onChange={(e) => set('hero', { ...c.hero, checks: toLines(e.target.value) })} />
        </Field>
      </Section>

      <Section title="Precios" hint="Deja el precio vacío para mostrar «Consúltanos» (y no publicarlo en Google).">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título" htmlFor="p-title" error={err('plansTitle')}>
            <Input id="p-title" value={c.plansTitle} onChange={(e) => set('plansTitle', e.target.value)} />
          </Field>
          <Field label="Bajada" htmlFor="p-sub" error={err('plansSubtitle')}>
            <Input id="p-sub" value={c.plansSubtitle} onChange={(e) => set('plansSubtitle', e.target.value)} />
          </Field>
        </div>
        {c.plans.map((p, i) => {
          const upd = (patch: Partial<typeof p>) => set('plans', c.plans.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <div key={p.id} className="flex flex-col gap-4 rounded-[22px] bg-white/60 p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <Field label="Plan" htmlFor={`pl-name-${i}`} error={err(`plans.${i}.name`)}>
                  <Input id={`pl-name-${i}`} value={p.name} onChange={(e) => upd({ name: e.target.value })} />
                </Field>
                <Field label="Precio al mes" htmlFor={`pl-price-${i}`} error={err(`plans.${i}.price`)}>
                  <Input
                    id={`pl-price-${i}`}
                    inputMode="decimal"
                    prefix="S/"
                    placeholder="Consúltanos"
                    defaultValue={p.price ?? ''}
                    onChange={(e) => {
                      const v = parseSoles(e.target.value);
                      upd({ price: v === null || Number.isNaN(v) ? null : v });
                    }}
                    className="tabular"
                  />
                </Field>
              </div>
              <Field label="Incluye (uno por línea)" htmlFor={`pl-feat-${i}`}>
                <Textarea id={`pl-feat-${i}`} rows={5} defaultValue={p.features.join('\n')} onChange={(e) => upd({ features: toLines(e.target.value) })} />
              </Field>
              <div className="flex flex-wrap items-end gap-4">
                <Field label="Texto del botón" htmlFor={`pl-cta-${i}`} className="min-w-[220px] flex-1">
                  <Input id={`pl-cta-${i}`} value={p.cta.label} onChange={(e) => upd({ cta: { ...p.cta, label: e.target.value } })} />
                </Field>
                <div className="flex flex-col gap-2">
                  <span className="field-label">Botón lleva a</span>
                  <Switch
                    checked={p.cta.kind === 'whatsapp'}
                    onChange={(on) => upd({ cta: { ...p.cta, kind: on ? 'whatsapp' : 'signup' } })}
                    label="El botón abre WhatsApp en vez del registro"
                    onLabel="WA"
                    offLabel="Reg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="field-label">Destacado</span>
                  <Switch checked={!!p.featured} onChange={(on) => upd({ featured: on })} label={`Destacar ${p.name}`} />
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Historia de origen">
        <Field label="Etiqueta" htmlFor="o-eyebrow" error={err('origin.eyebrow')}>
          <Input id="o-eyebrow" value={c.origin.eyebrow} onChange={(e) => set('origin', { ...c.origin, eyebrow: e.target.value })} />
        </Field>
        <Field label="Título" htmlFor="o-title" error={err('origin.title')}>
          <Input id="o-title" value={c.origin.title} onChange={(e) => set('origin', { ...c.origin, title: e.target.value })} />
        </Field>
        <Field label="Texto" htmlFor="o-text" error={err('origin.text')}>
          <Textarea id="o-text" rows={3} value={c.origin.text} onChange={(e) => set('origin', { ...c.origin, text: e.target.value })} />
        </Field>
        <Field label="Cápsulas (una por línea, máx. 4)" htmlFor="o-bullets">
          <Textarea id="o-bullets" rows={3} defaultValue={c.origin.bullets.join('\n')} onChange={(e) => set('origin', { ...c.origin, bullets: toLines(e.target.value) })} />
        </Field>
      </Section>

      <Section title="Preguntas frecuentes" hint="También se publican para Google (resultados enriquecidos).">
        {c.faqs.map((f, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[22px] bg-white/60 p-4">
            <div className="flex items-end gap-2">
              <Field label={`Pregunta ${i + 1}`} htmlFor={`faq-q-${i}`} error={err(`faqs.${i}.q`)} className="flex-1">
                <Input id={`faq-q-${i}`} value={f.q} onChange={(e) => set('faqs', c.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
              </Field>
              <Button variant="secondary" size="icon" aria-label={`Quitar pregunta ${i + 1}`} onClick={() => set('faqs', c.faqs.filter((_, j) => j !== i))}>
                <Trash2 className="size-5 text-alert" aria-hidden />
              </Button>
            </div>
            <Textarea aria-label={`Respuesta ${i + 1}`} rows={3} value={f.a} onChange={(e) => set('faqs', c.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
          </div>
        ))}
        {c.faqs.length < 12 ? (
          <Button variant="secondary" onClick={() => set('faqs', [...c.faqs, { q: '', a: '' }])} className="self-start">
            <Plus className="size-5" aria-hidden />
            Agregar pregunta
          </Button>
        ) : null}
      </Section>

      <Section title="Cierre">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título" htmlFor="f-t1" error={err('finalCta.titleStart')}>
            <Input id="f-t1" value={c.finalCta.titleStart} onChange={(e) => set('finalCta', { ...c.finalCta, titleStart: e.target.value })} />
          </Field>
          <Field label="Título · resaltado" htmlFor="f-t2" error={err('finalCta.titleHighlight')}>
            <Input id="f-t2" value={c.finalCta.titleHighlight} onChange={(e) => set('finalCta', { ...c.finalCta, titleHighlight: e.target.value })} />
          </Field>
        </div>
        <Field label="Bajada" htmlFor="f-sub" error={err('finalCta.subtitle')}>
          <Input id="f-sub" value={c.finalCta.subtitle} onChange={(e) => set('finalCta', { ...c.finalCta, subtitle: e.target.value })} />
        </Field>
      </Section>

      <div className="sticky bottom-28 z-10 flex flex-wrap justify-end gap-2.5 md:bottom-[112px]">
        <Link href="/" target="_blank" className="glass-float flex min-h-16 items-center gap-2 rounded-full px-6 text-base font-bold text-ink no-underline">
          <ExternalLink className="size-5" aria-hidden />
          Ver landing
        </Link>
        <Button size="lg" loading={saving} disabled={!dirty} onClick={save} className="min-w-[240px]">
          {saving ? null : <Check className="size-5" aria-hidden />}
          {dirty ? 'Publicar cambios' : 'Sin cambios'}
        </Button>
      </div>
    </div>
  );
}
