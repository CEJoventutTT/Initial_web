-- Non-personal reference data for local development.
insert into public.badges (code, name, description)
values
  ('first_training', 'Primer entrenamiento', 'Registra tu primer entrenamiento.'),
  ('first_attendance', 'Primera asistencia', 'Asiste a una sesión del club.'),
  ('seven_day_streak', 'Racha de siete días', 'Mantén actividad durante siete días.')
on conflict (code) do nothing;

insert into public.quests (code, title, description, xp_reward, steps)
values
  (
    'weekly_attendance',
    'Asiste esta semana',
    'Participa en dos sesiones del club.',
    50,
    '[{"metric":"attendance_present","target":2}]'::jsonb
  ),
  (
    'weekly_training',
    'Registra tus entrenamientos',
    'Registra tres entrenamientos esta semana.',
    40,
    '[{"metric":"training_log","target":3}]'::jsonb
  )
on conflict (code) do nothing;
