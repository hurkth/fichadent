'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { LoaderCircle, Search, SearchX, UserPlus, X } from 'lucide-react';
import { PatientPoster } from '@/components/shared/patient-poster';
import { usePatientSearch } from '@/hooks/use-patient-search';
import type { PatientCard } from '@/types/domain';
import { newPatientHref } from './search-results';

export interface HomeSearchProps {
  /** Tablero de Inicio (Ahora, Hoy, Recientes). */
  children: ReactNode;
  initialQuery?: string;
  initialResults?: PatientCard[];
}

/**
 * Buscador de Inicio. La consulta vive en ?q= (la escribe el buscador del dock en tablet o el
 * de arriba en móvil), así "atrás" desde la ficha conserva los resultados.
 * Tablet: resultados en un panel de vidrio que sube desde el dock. Móvil: reemplazan el tablero.
 */
export function HomeSearch({ children, initialQuery = '', initialResults = [] }: HomeSearchProps) {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const search = usePatientSearch(q, { query: initialQuery.trim(), results: initialResults });

  const setQ = (value: string) => {
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  };

  const hasQuery = q.trim().length >= 2;
  const settled = search.query === q.trim() && !search.loading;

  const results = !hasQuery ? null : search.error ? (
    <p role="alert" className="m-0 px-3 py-4 text-base font-bold text-alert">
      {search.error}
    </p>
  ) : !settled ? (
    <p className="m-0 flex items-center gap-2 px-3 py-4 text-[15px] font-semibold text-ink-muted">
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      Buscando…
    </p>
  ) : (
    <div aria-live="polite" className="flex flex-col">
      <h2 className="m-0 px-3 pt-2 pb-1 text-xs font-bold tracking-[0.06em] text-ink-muted uppercase">
        {search.results.length ? `${search.results.length} ${search.results.length === 1 ? 'paciente' : 'pacientes'}` : `No encontramos “${search.query}”`}
      </h2>
      {search.results.length === 0 ? (
        <p className="m-0 flex items-center gap-2 px-3 pb-2 text-[15px] font-semibold text-ink-muted">
          <SearchX className="size-5" aria-hidden />
          Revisa cómo está escrito o busca por DNI o celular.
        </p>
      ) : (
        search.results.map((p) => <PatientPoster key={p.id} patient={p} variant="row" />)
      )}
      <Link
        href={newPatientHref(search.query)}
        className="mt-1 flex min-h-14 items-center gap-2.5 rounded-[22px] px-3 text-[15px] font-bold text-brand-700 no-underline hover:bg-white/60"
      >
        <UserPlus className="size-5" aria-hidden />
        Crear paciente “{search.query}”
      </Link>
    </div>
  );

  return (
    <>
      {/* Móvil: buscador arriba */}
      <label className="glass-float flex h-14 shrink-0 items-center gap-2.5 rounded-full pr-1.5 pl-5 text-ink-muted md:hidden">
        <Search className="size-5 shrink-0" strokeWidth={2.2} aria-hidden />
        <input
          type="search"
          aria-label="Buscar paciente por nombre, DNI o celular"
          placeholder="Nombre, DNI o celular"
          autoComplete="off"
          enterKeyHint="search"
          defaultValue={q}
          key={q === '' ? 'empty' : 'q'}
          onChange={(e) => setQ(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[17px] font-semibold text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button type="button" aria-label="Borrar búsqueda" onClick={() => setQ('')} className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-fill text-ink">
            <X className="size-5" aria-hidden />
          </button>
        ) : null}
      </label>

      {hasQuery ? <div className="glass-card rounded-[28px] p-2 md:hidden">{results}</div> : null}
      <div className={hasQuery ? 'hidden md:contents' : 'contents'}>{children}</div>

      {/* Tablet: panel flotante sobre el dock */}
      {hasQuery ? (
        <div className="fixed inset-x-10 bottom-[100px] z-30 hidden justify-center md:flex">
          <div className="glass-float max-h-[60vh] w-full max-w-[860px] overflow-y-auto rounded-[32px] bg-white/90 p-2">{results}</div>
        </div>
      ) : null}
    </>
  );
}
