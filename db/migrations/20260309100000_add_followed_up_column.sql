alter table public.tracked_applications
  add column if not exists followed_up boolean not null default false;
