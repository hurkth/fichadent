import { SALES_WHATSAPP } from '@/lib/constants';
import { whatsappUrl } from '@/lib/contact';

export const SIGNUP_HREF = '/registro';
export const LOGIN_HREF = '/login';

/** WhatsApp de ventas con mensaje prellenado; sin número configurado → registro. */
export function salesHref(message: string): string {
  return SALES_WHATSAPP ? whatsappUrl(SALES_WHATSAPP, message) : SIGNUP_HREF;
}

export const isExternal = (href: string) => href.startsWith('http');
