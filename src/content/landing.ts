/**
 * Textos de la landing (spec 04). Una sola fuente para lo que se ve y para el JSON-LD,
 * así Google lee exactamente lo mismo que el doctor.
 */

export const LANDING = {
  title: 'Software dental en Perú · Historia clínica y agenda | Fichadent',
  description:
    'Historia clínica odontológica y agenda para tu consultorio. Busca pacientes, ve alertas médicas y recuerda citas por WhatsApp. Prueba gratis 5 días.',
  keywords: [
    'software dental',
    'software odontológico',
    'historia clínica odontológica',
    'agenda para dentistas',
    'programa para consultorio dental',
    'software dental Perú',
  ],
} as const;

export interface Plan {
  id: string;
  name: string;
  /** Soles al mes. null = aún sin definir → se muestra "Consúltanos" y no se publica en el JSON-LD. */
  price: number | null;
  featured?: boolean;
  features: string[];
  cta: { label: string; kind: 'signup' | 'whatsapp' };
}

export const PLANS: Plan[] = [
  {
    id: 'consultorio',
    name: 'Consultorio',
    price: null,
    featured: true,
    features: [
      'Pacientes ilimitados',
      'Historia clínica, visitas y tratamientos',
      'Precios de tus intervenciones',
      'Agenda de día, semana y mes',
      'Recordatorios por WhatsApp',
      'Fotos y radiografías',
      'Tu logo y tu color',
    ],
    cta: { label: 'Empezar prueba gratis', kind: 'signup' },
  },
  {
    id: 'consultorio-web',
    name: 'Consultorio + página web',
    price: null,
    features: [
      'Todo lo del plan Consultorio',
      'Página web de tu consultorio lista para Google',
      'Botón de WhatsApp para que te escriban',
      'Ayuda para pasar tus historias en papel',
    ],
    cta: { label: 'Hablar por WhatsApp', kind: 'whatsapp' },
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Tengo que instalar algo?',
    a: 'No. Fichadent funciona en el navegador de tu tablet, celular o laptop. Entras con tu correo y contraseña, y puedes agregarlo a la pantalla de inicio como una app.',
  },
  {
    q: '¿Quién puede ver a mis pacientes?',
    a: 'Solo tú. Cada doctor tiene su propia cuenta y solo ve a sus pacientes. La información viaja cifrada y se guarda en la nube.',
  },
  {
    q: '¿Necesito internet?',
    a: 'Sí, para guardar los cambios. Si se cae la señal, Fichadent te avisa al momento para que no pierdas lo que estabas escribiendo.',
  },
  {
    q: '¿Puedo poner mis propios precios?',
    a: 'Sí. En Ajustes pones el precio de cada intervención (resinas, endodoncias, profilaxis y las que agregues). Al registrar la visita el precio aparece solo y lo puedes cambiar.',
  },
  {
    q: '¿Qué pasa cuando terminan los 5 días gratis?',
    a: 'Te escribimos para activar tu plan. No te pedimos tarjeta para probar y tus pacientes siguen guardados.',
  },
  {
    q: '¿Me ayudan a pasar mis historias en papel?',
    a: 'Sí. Escríbenos por WhatsApp y coordinamos cómo digitalizarlas mientras tú sigues atendiendo.',
  },
];

export const CITIES = [
  { slug: 'lima', name: 'Lima' },
  { slug: 'arequipa', name: 'Arequipa' },
  { slug: 'puno', name: 'Puno' },
  { slug: 'cusco', name: 'Cusco' },
  { slug: 'trujillo', name: 'Trujillo' },
] as const;

export const WHATSAPP_MESSAGES = {
  general: 'Hola, quiero saber más de Fichadent para mi consultorio.',
  paper: 'Hola, tengo historias en papel y quiero ayuda para digitalizarlas en Fichadent.',
  web: 'Hola, me interesa el plan Consultorio + página web de Fichadent.',
} as const;
