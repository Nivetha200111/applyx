create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text unique not null,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  tailors_used_this_month integer not null default 0 check (tailors_used_this_month >= 0),
  billing_cycle_start timestamptz not null default timezone('utc', now()),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.master_resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  parsed_data jsonb not null,
  raw_text text,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_descriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text,
  job_title text,
  raw_text text not null,
  parsed_data jsonb,
  source_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tailored_resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  master_resume_id uuid references public.master_resumes(id) on delete set null,
  job_description_id uuid references public.job_descriptions(id) on delete set null,
  tailored_data jsonb not null,
  match_score_before integer check (match_score_before between 0 and 100),
  match_score_after integer check (match_score_after between 0 and 100),
  template_used text not null default 'classic',
  pdf_url text,
  docx_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists master_resumes_user_id_idx on public.master_resumes (user_id, created_at desc);
create index if not exists job_descriptions_user_id_idx on public.job_descriptions (user_id, created_at desc);
create index if not exists tailored_resumes_user_id_idx on public.tailored_resumes (user_id, created_at desc);
create index if not exists usage_log_user_id_idx on public.usage_log (user_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_master_resumes_updated_at on public.master_resumes;
create trigger set_master_resumes_updated_at
before update on public.master_resumes
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.master_resumes enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.tailored_resumes enable row level security;
alter table public.usage_log enable row level security;

drop policy if exists "Users access own data" on public.profiles;
create policy "Users access own data"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users access own resumes" on public.master_resumes;
create policy "Users access own resumes"
on public.master_resumes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users access own JDs" on public.job_descriptions;
create policy "Users access own JDs"
on public.job_descriptions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users access own tailored" on public.tailored_resumes;
create policy "Users access own tailored"
on public.tailored_resumes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users access own usage" on public.usage_log;
create policy "Users access own usage"
on public.usage_log
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'resume-files',
    'resume-files',
    false,
    5242880,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'generated-resumes',
    'generated-resumes',
    false,
    5242880,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
on conflict (id) do nothing;

drop policy if exists "Users manage own storage objects" on storage.objects;
create policy "Users manage own storage objects"
on storage.objects
for all
using (
  bucket_id in ('resume-files', 'generated-resumes')
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id in ('resume-files', 'generated-resumes')
  and auth.uid()::text = (storage.foldername(name))[1]
);
