'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';
import { LOGIN_HREF } from './links';

/**
 * "Iniciar sesión" o, si ya hay sesión en este navegador, "Mi consultorio".
 * La landing es estática y cacheada: la sesión se consulta en el navegador.
 */
export function AccountLink({ className }: { className?: string }) {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    let alive = true;
    try {
      createClient()
        .auth.getSession()
        .then(({ data }) => alive && setLoggedIn(!!data.session))
        .catch(() => {});
    } catch {
      /* sin variables de Supabase: se queda "Iniciar sesión" */
    }
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Link href={loggedIn ? '/inicio' : LOGIN_HREF} className={cn(className, loggedIn && 'font-bold text-brand-700')}>
      {loggedIn ? 'Mi consultorio' : 'Iniciar sesión'}
    </Link>
  );
}
