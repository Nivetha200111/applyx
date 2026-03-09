create table if not exists public.dismissed_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  external_job_id text not null,
  source text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists dismissed_jobs_user_job_idx
  on public.dismissed_jobs (user_id, external_job_id);

create index if not exists dismissed_jobs_user_id_idx
  on public.dismissed_jobs (user_id, created_at desc);
