'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { createService, saveServicePrices } from '@/lib/actions/services';
import { cn } from '@/lib/cn';
import { formatSoles, parseSoles } from '@/lib/format';
import type { ServiceSetting } from '@/lib/data/catalogs';

type Row = { priceText: string; hidden: boolean };

const toText = (n: number | null) => (n === null ? '' : String(n));

/**
 * Ajustes › Precios de intervenciones.
 * Precio por pieza (o por tratamiento si no lleva pieza) y si aparece en Nueva visita.
 * Las visitas ya registradas guardan su propio precio: cambiar la lista no las modifica.
 */
export function ServicePricesForm({ services }: { services: ServiceSetting[] }) {
  const router = useRouter();
  const toast = useToast();
  const initial = useMemo(() => Object.fromEntries(services.map((s) => [s.id, { priceText: toText(s.price), hidden: s.hidden }])), [services]);
  const [rows, setRows] = useState<Record<string, Row>>(initial);
  const [saving, setSaving] = useState(false);
  const [onlyVisible, setOnlyVisible] = useState(false);

  const categories = useMemo(() => {
    const map = new Map<string, ServiceSetting[]>();
    [...services].sort((a, b) => a.sort_order - b.sort_order).forEach((s) => map.set(s.category, [...(map.get(s.category) ?? []), s]));
    return [...map.entries()];
  }, [services]);

  const invalid = (id: string) => {
    const v = parseSoles(rows[id]?.priceText ?? '');
    return v !== null && (Number.isNaN(v) || v < 0);
  };
  const dirtyIds = services
    .map((s) => s.id)
    .filter((id) => rows[id]!.priceText.trim() !== initial[id]!.priceText || rows[id]!.hidden !== initial[id]!.hidden);
  const hasErrors = services.some((s) => invalid(s.id));

  const set = (id: string, patch: Partial<Row>) => setRows((r) => ({ ...r, [id]: { ...r[id]!, ...patch } }));

  const save = async () => {
    if (hasErrors) {
      toast({ title: 'Revisa los precios marcados en rojo.', tone: 'error' });
      return;
    }
    setSaving(true);
    const res = await saveServicePrices(dirtyIds.map((id) => ({ serviceId: id, price: parseSoles(rows[id]!.priceText), hidden: rows[id]!.hidden })));
    setSaving(false);
    if (!res.ok) return toast({ title: res.error, tone: 'error' });
    toast({ title: res.data.count === 1 ? 'Precio guardado' : 'Precios guardados' });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-5 pb-28 md:max-w-[860px] md:px-8 md:py-7">
      <Card className="flex flex-col gap-2 p-5 md:p-6">
        <h2 className="m-0 text-lg font-extrabold">Precios de intervenciones</h2>
        <p className="m-0 text-[15px] leading-snug font-semibold text-ink-muted">
          Pon tu precio a cada intervención. Aparece al registrar una visita y lo puedes cambiar ahí mismo. Si una intervención lleva pieza, el
          precio es <strong className="text-ink">por pieza</strong>. Apaga las que no haces para que no salgan en Nueva visita.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip size="sm" selected={!onlyVisible} onClick={() => setOnlyVisible(false)}>
            Todas
          </Chip>
          <Chip size="sm" selected={onlyVisible} onClick={() => setOnlyVisible(true)}>
            Solo las que uso
          </Chip>
        </div>
      </Card>

      {categories.map(([category, items]) => {
        const shown = onlyVisible ? items.filter((s) => !rows[s.id]!.hidden) : items;
        if (shown.length === 0) return null;
        return (
          <Card as="section" key={category} aria-label={category} className="flex flex-col p-2 md:p-3">
            <h3 className="m-0 px-3 pt-2 pb-1 text-[13px] font-extrabold tracking-[.06em] text-ink-muted uppercase">{category}</h3>
            <ul className="m-0 flex list-none flex-col p-0">
              {shown.map((s) => {
                const row = rows[s.id]!;
                const bad = invalid(s.id);
                return (
                  <li
                    key={s.id}
                    className={cn(
                      'flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft px-3 py-3 first:border-0',
                      row.hidden && 'opacity-60',
                    )}
                  >
                    <div className="flex min-w-[180px] flex-1 flex-col">
                      <label htmlFor={`price-${s.id}`} className="text-base font-bold">
                        {s.name}
                      </label>
                      <span className="text-[13px] font-semibold text-ink-muted">
                        {s.requires_tooth ? 'Por pieza' : 'Por tratamiento'}
                        {s.own ? ' · Agregada por ti' : ''}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Input
                        id={`price-${s.id}`}
                        inputMode="decimal"
                        prefix="S/"
                        placeholder="Sin precio"
                        value={row.priceText}
                        invalid={bad}
                        onChange={(e) => set(s.id, { priceText: e.target.value })}
                        className="tabular w-[170px]"
                        aria-describedby={bad ? `price-err-${s.id}` : undefined}
                      />
                      {bad ? (
                        <span id={`price-err-${s.id}`} role="alert" className="text-[12px] font-bold text-alert">
                          Ej. 80 o 80.50
                        </span>
                      ) : null}
                    </div>
                    <Switch
                      checked={!row.hidden}
                      onChange={(on) => set(s.id, { hidden: !on })}
                      label={`Mostrar ${s.name} en Nueva visita`}
                      onLabel="Uso"
                      offLabel="No"
                    />
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}

      <NewServiceCard categories={categories.map(([c]) => c)} onCreated={() => router.refresh()} />

      <div className="sticky bottom-24 z-10 flex justify-end md:bottom-6">
        <Button size="lg" loading={saving} disabled={dirtyIds.length === 0} onClick={save} className="w-full shadow-[0_10px_24px_rgba(17,17,17,.18)] md:w-auto md:min-w-[280px]">
          {saving ? null : <Check className="size-5" aria-hidden />}
          {dirtyIds.length ? `Guardar ${dirtyIds.length === 1 ? '1 cambio' : `${dirtyIds.length} cambios`}` : 'Sin cambios'}
        </Button>
      </div>
    </div>
  );
}

/** Agregar una intervención que no está en la lista (queda solo para este consultorio). */
function NewServiceCard({ categories, onCreated }: { categories: string[]; onCreated: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [requiresTooth, setRequiresTooth] = useState(false);
  const [priceText, setPriceText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" size="lg" onClick={() => setOpen(true)} className="self-start">
        <Plus className="size-5" aria-hidden />
        Agregar intervención
      </Button>
    );
  }

  const submit = async () => {
    const price = parseSoles(priceText);
    if (price !== null && (Number.isNaN(price) || price < 0)) return setErrors({ price: 'Escribe el precio en soles, ej. 80 o 80.50' });
    setBusy(true);
    const res = await createService({ name, category: category === '__new' ? newCategory : category, requiresTooth, price });
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return toast({ title: res.error, tone: 'error' });
    }
    toast({ title: `“${name.trim()}” agregada${price !== null ? ` · ${formatSoles(price)}` : ''}` });
    setName('');
    setPriceText('');
    setNewCategory('');
    setRequiresTooth(false);
    setErrors({});
    setOpen(false);
    onCreated();
  };

  return (
    <Card as="section" aria-label="Agregar intervención" className="flex flex-col gap-5 p-5 md:p-6">
      <h2 className="m-0 text-lg font-extrabold">Agregar intervención</h2>
      <Field label="Nombre" htmlFor="new-service-name" required error={errors.name}>
        <Input id="new-service-name" placeholder="Ej. Carilla de resina" value={name} invalid={!!errors.name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Categoría" error={errors.category}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c} size="sm" selected={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
          <Chip size="sm" selected={category === '__new'} onClick={() => setCategory('__new')}>
            <Plus className="size-4" aria-hidden />
            Nueva
          </Chip>
        </div>
        {category === '__new' ? (
          <Input aria-label="Nombre de la nueva categoría" placeholder="Ej. Estética" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        ) : null}
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Precio" htmlFor="new-service-price" error={errors.price} hint={<span className="text-ink-muted">{requiresTooth ? 'Por pieza' : 'Por tratamiento'}</span>}>
          <Input
            id="new-service-price"
            inputMode="decimal"
            prefix="S/"
            placeholder="Sin precio"
            value={priceText}
            invalid={!!errors.price}
            onChange={(e) => setPriceText(e.target.value)}
            className="tabular"
          />
        </Field>
        <div className="flex flex-col gap-2">
          <span className="field-label">¿Se elige pieza dental?</span>
          <Switch checked={requiresTooth} onChange={setRequiresTooth} label="Se elige pieza dental" />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
          Cancelar
        </Button>
        <Button onClick={submit} loading={busy}>
          {busy ? null : <Plus className="size-5" aria-hidden />}
          Agregar
        </Button>
      </div>
    </Card>
  );
}
