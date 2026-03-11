-- ApplyX database schema for Neon PostgreSQL
-- Run this against your Neon database to initialize all tables.

create extension if not exists "pgcrypto";

-- Enums

do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_tier') then
    create type public.plan_tier as enum ('free', 'basic', 'premium');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'model_tier') then
    create type public.model_tier as enum ('demo', 'basic', 'premium');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'resume_template') then
    create type public.resume_template as enum ('classic', 'modern', 'minimal');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'usage_action') then
    create type public.usage_action as enum (
      'demo',
      'parse_resume',
      'parse_job_description',
      'parse_tracker_jd',
      'tailor_resume',
      'generate_pdf',
      'generate_docx',
      'download',
      'login',
      'purchase'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'bookmarked',
      'applying',
      'applied',
      'screening',
      'interviewing',
      'offer',
      'accepted',
      'rejected',
      'withdrawn',
      'ghosted'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'work_mode') then
    create type public.work_mode as enum ('remote', 'hybrid', 'onsite', 'unknown');
  end if;
end
$$;

-- Helper trigger function

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Core tables

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null unique,
  password_hash text not null,
  phone text,
  location text,
  plan public.plan_tier not null default 'free',
  billing_provider text not null default 'dodo',
  billing_cycle_start timestamptz not null default timezone('utc', now()),
  billing_cycle_end timestamptz,
  demo_tailors_used integer not null default 0 check (demo_tailors_used >= 0),
  monthly_tailors_used integer not null default 0 check (monthly_tailors_used >= 0),
  monthly_tailor_limit integer not null default 0 check (monthly_tailor_limit >= 0),
  monthly_tracker_parses_used integer not null default 0 check (monthly_tracker_parses_used >= 0),
  preferred_model_tier public.model_tier not null default 'demo',
  billing_customer_id text,
  billing_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.master_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_url text,
  file_kind text not null check (file_kind in ('pdf', 'docx')),
  parsed_data jsonb not null,
  raw_text text,
  storage_provider text not null default 'database',
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name text,
  job_title text,
  raw_text text not null,
  parsed_data jsonb,
  source_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tailored_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  master_resume_id uuid references public.master_resumes(id) on delete set null,
  job_description_id uuid references public.job_descriptions(id) on delete set null,
  tailored_data jsonb not null,
  changes jsonb,
  plan_tier public.plan_tier not null default 'free',
  model_tier public.model_tier not null default 'demo',
  primary_model text not null default 'gpt-4o-mini',
  fallback_model text,
  match_score_before integer check (match_score_before between 0 and 100),
  match_score_after integer check (match_score_after between 0 and 100),
  template_used public.resume_template not null default 'classic',
  pdf_url text,
  docx_url text,
  storage_provider text not null default 'database',
  generation_latency_ms integer check (
    generation_latency_ms is null or generation_latency_ms >= 0
  ),
  is_demo boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  plan_tier public.plan_tier not null default 'free',
  model_tier public.model_tier not null default 'demo',
  request_count integer not null default 1 check (request_count > 0),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_tier public.plan_tier not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  billing_provider text not null default 'dodo',
  provider_checkout_id text unique,
  provider_payment_id text unique,
  provider_subscription_id text,
  provider_customer_id text,
  provider_signature text,
  provider_event_type text,
  payment_metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz
);

create table if not exists public.tracked_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name text not null default '',
  role_title text not null default '',
  location text,
  work_mode public.work_mode not null default 'unknown',
  salary_min integer,
  salary_max integer,
  salary_currency text not null default 'INR',
  status public.application_status not null default 'bookmarked',
  priority integer not null default 0 check (priority between 0 and 5),
  source_url text,
  source_platform text,
  raw_jd_text text,
  parsed_jd_data jsonb,
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  experience_required text,
  applied_at timestamptz,
  deadline_at timestamptz,
  follow_up_at timestamptz,
  last_activity_at timestamptz,
  notes text,
  contact_name text,
  contact_email text,
  tailored_resume_id uuid references public.tailored_resumes(id) on delete set null,
  prep_resources jsonb not null default '[]'::jsonb,
  authenticity_score integer check (
    authenticity_score is null or authenticity_score between 0 and 100
  ),
  authenticity_assessment jsonb,
  authenticity_checked_at timestamptz,
  followed_up boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.request_rate_limits (
  route_key text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (route_key, identifier_hash)
);

create table if not exists public.dismissed_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  external_job_id text not null,
  source text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Indexes

create index if not exists users_plan_idx on public.users (plan);
create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_token_hash_idx on public.sessions (session_token_hash);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);
create index if not exists master_resumes_user_id_idx on public.master_resumes (user_id, created_at desc);
create unique index if not exists master_resumes_primary_idx on public.master_resumes (user_id)
where is_primary;
create index if not exists job_descriptions_user_id_idx on public.job_descriptions (user_id, created_at desc);
create index if not exists tailored_resumes_user_id_idx on public.tailored_resumes (user_id, created_at desc);
create index if not exists tailored_resumes_plan_model_idx on public.tailored_resumes (plan_tier, model_tier, created_at desc);
create index if not exists usage_log_user_id_idx on public.usage_log (user_id, created_at desc);
create index if not exists payments_user_id_idx on public.payments (user_id, created_at desc);
create index if not exists payments_checkout_id_idx on public.payments (provider_checkout_id);
create index if not exists payments_subscription_id_idx on public.payments (provider_subscription_id, created_at desc);
create index if not exists tracked_apps_user_id_idx on public.tracked_applications (user_id, created_at desc);
create index if not exists tracked_apps_user_status_idx on public.tracked_applications (user_id, status);
create index if not exists tracked_apps_user_archived_idx on public.tracked_applications (user_id, is_archived, updated_at desc);
create index if not exists tracked_apps_skills_idx on public.tracked_applications using gin (required_skills);
create index if not exists request_rate_limits_window_idx on public.request_rate_limits (window_started_at);
create unique index if not exists dismissed_jobs_user_job_idx on public.dismissed_jobs (user_id, external_job_id);
create index if not exists dismissed_jobs_user_id_idx on public.dismissed_jobs (user_id, created_at desc);

-- Triggers

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_master_resumes_updated_at on public.master_resumes;
create trigger set_master_resumes_updated_at
before update on public.master_resumes
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_job_descriptions_updated_at on public.job_descriptions;
create trigger set_job_descriptions_updated_at
before update on public.job_descriptions
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_tailored_resumes_updated_at on public.tailored_resumes;
create trigger set_tailored_resumes_updated_at
before update on public.tailored_resumes
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_tracked_applications_updated_at on public.tracked_applications;
create trigger set_tracked_applications_updated_at
before update on public.tracked_applications
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_request_rate_limits_updated_at on public.request_rate_limits;
create trigger set_request_rate_limits_updated_at
before update on public.request_rate_limits
for each row
execute procedure public.set_updated_at();
