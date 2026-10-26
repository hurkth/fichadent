-- =====================================================================
-- FICHADENT · Datos de DEMO (ficticios)
-- 1. Regístrate en la app con el correo de demo (ej. demo@fichadent.pe).
-- 2. Cambia el correo abajo si usas otro y ejecuta en SQL Editor.
-- Se puede volver a correr: borra y recrea los datos de ESA cuenta.
-- Fechas relativas a hoy: la agenda de la demo siempre se ve llena.
-- =====================================================================
do $$
declare
  demo_email constant text := 'demo@fichadent.pe';
  cid  uuid;
  pid  uuid;
  vid  uuid;
  aid  uuid;
  today date := (now() at time zone 'America/Lima')::date;
  d    date;
  r    record;
  i    int := 0;
begin
  select m.clinic_id into cid
  from auth.users u join public.memberships m on m.user_id = u.id
  where u.email = demo_email;
  if cid is null then
    raise exception 'Primero regístrate en la app con %', demo_email;
  end if;

  -- Limpieza (solo de la cuenta demo)
  delete from public.files              where clinic_id = cid;
  delete from public.treatments         where clinic_id = cid;
  delete from public.visits             where clinic_id = cid;
  delete from public.appointments       where clinic_id = cid;
  delete from public.patient_conditions where clinic_id = cid;
  delete from public.patients           where clinic_id = cid;
  delete from public.audit_log          where clinic_id = cid;

  update public.clinics
     set name = 'Consultorio Dental Sonrisa (demo)', phone = '987654321',
         address = 'Jr. Lima 123, Puno', plan = 'demo', record_seq = 0,
         trial_ends_at = now() + interval '10 years'
   where id = cid;
  update public.memberships set display_name = 'Dra. Lucía Mamani'
   where clinic_id = cid;

  -- Pacientes ficticios
  for r in select * from (values
    ('María Elena',   'Quispe Mamani',     '40123456', '1985-03-12', 'F', '951234567', 'Docente',      'H-0128', 'allergy',        'Penicilina'),
    ('José Luis',     'Condori Apaza',     '41234567', '1978-07-25', 'M', '952345678', 'Comerciante',  'H-0045', 'diabetes',       null),
    ('Rosa',          'Huanca Ccama',      '42345678', '1992-11-02', 'F', '953456789', 'Enfermera',    null,     null,             null),
    ('Carlos Alberto','Pari Chambi',       '43456789', '1969-01-18', 'M', '954567890', 'Chofer',       'H-0210', 'blood_pressure', 'Alta, toma losartán'),
    ('Lucía',         'Choque Flores',     '44567890', '2001-05-30', 'F', '955678901', 'Estudiante',   null,     null,             null),
    ('Juan Pablo',    'Mamani Ticona',     '45678901', '1988-09-14', 'M', '956789012', 'Ingeniero',    null,     null,             null),
    ('Ana Sofía',     'Coaquira Llanos',   '46789012', '2010-12-08', 'F', '957890123', 'Estudiante',   null,     null,             null),
    ('Pedro',         'Vilca Calsina',     '47890123', '1955-04-21', 'M', '958901234', 'Jubilado',     'H-0012', 'heart_disease',  'Marcapasos'),
    ('Gabriela',      'Turpo Yupanqui',    '48901234', '1995-08-03', 'F', '959012345', 'Contadora',    null,     'pregnant',       '5 meses'),
    ('Miguel Ángel',  'Larico Machaca',    '49012345', '1982-02-27', 'M', '960123456', 'Agricultor',   'H-0099', null,             null),
    ('Carmen',        'Arapa Sucasaire',   null,       '1973-06-16', 'F', '961234567', 'Artesana',     'H-0301', 'medication',     'Anticoagulantes'),
    ('Diego',         'Cutipa Zea',        '50123456', '1999-10-11', 'M', '962345678', 'Diseñador',    null,     null,             null)
  ) as t(fn, ln, dni, bd, sex, phone, occ, legacy, cond, detail)
  loop
    i := i + 1;
    insert into public.patients (clinic_id, first_names, last_names, dni, birth_date, sex,
                                 phone, occupation, legacy_record_number, address)
    values (cid, r.fn, r.ln, r.dni, r.bd::date, r.sex, r.phone, r.occ, r.legacy, 'Puno')
    returning id into pid;

    if r.cond is not null then
      insert into public.patient_conditions (clinic_id, patient_id, condition_id, detail)
      select cid, pid, c.id, r.detail from public.conditions c
      where c.code = r.cond and c.clinic_id is null;
    end if;

    -- Historial: 1 a 3 visitas pasadas con tratamientos
    for k in 1 .. (i % 3) + 1 loop
      insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
      values (cid, pid, today - (k * 21 + i * 3),
              (array['Dolor de muela','Control','Limpieza','Sensibilidad al frío'])[(i + k) % 4 + 1],
              'Paciente colaborador. Indicaciones entregadas.')
      returning id into vid;

      insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, notes)
      select cid, pid, vid, s.id,
             case when s.requires_tooth then (array['16','26','36','46','11','21','47','37'])[(i + k) % 8 + 1] end,
             null
      from public.services s
      where s.clinic_id is null
        and s.name = (array['Resina simple','Profilaxis','Endodoncia unirradicular',
                            'Destartraje','Resina compuesta','Exodoncia','Consulta / evaluación'])[(i * k) % 7 + 1];
    end loop;

    -- Agenda: citas de esta semana y la próxima (9:00–18:00 Lima, sin domingos)
    d := today + ((i % 10) - 2);
    if extract(dow from d) = 0 then d := d + 1; end if;
    insert into public.appointments (clinic_id, patient_id, starts_at, ends_at, status, reason)
    values (cid, pid,
            (d + make_time(9 + (i % 9), case when i % 2 = 0 then 0 else 30 end, 0))
              at time zone 'America/Lima',
            (d + make_time(9 + (i % 9), case when i % 2 = 0 then 0 else 30 end, 0) + interval '30 minutes')
              at time zone 'America/Lima',
            case when d < today then (array['no_show','done'])[(i % 2) + 1]
                 when i % 3 = 0 then 'confirmed' else 'scheduled' end,
            (array['Control','Resina','Limpieza','Evaluación'])[i % 4 + 1])
    returning id into aid;

    -- Las citas pasadas atendidas tienen su visita
    if d < today and i % 2 = 1 then
      insert into public.visits (clinic_id, patient_id, appointment_id, visit_date, reason)
      values (cid, pid, aid, d, 'Control');
    end if;
  end loop;

  -- Citas de personas aún no registradas
  insert into public.appointments (clinic_id, guest_name, guest_phone, starts_at, ends_at, reason)
  values
    (cid, 'Roberto Ccori', '963456789',
     (today + 1 + time '18:00') at time zone 'America/Lima',
     (today + 1 + time '18:30') at time zone 'America/Lima', 'Primera consulta'),
    (cid, 'Silvia Pacompía', '964567890',
     (today + 3 + time '16:00') at time zone 'America/Lima',
     (today + 3 + time '17:00') at time zone 'America/Lima', 'Blanqueamiento');

  raise notice 'Demo lista: % pacientes', i;
end $$;
