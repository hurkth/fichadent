-- Fichadent · 0002 · files.page_number
-- Para bases creadas con una versión de 0001 sin esta columna. Seguro de correr siempre.
alter table public.files add column if not exists page_number integer;
notify pgrst, 'reload schema';
