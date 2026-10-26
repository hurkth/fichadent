/** Datos estructurados para Google. El contenido sale de src/content (mismo texto que se ve). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapa comillas; "<" se escapa para no cerrar el <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
