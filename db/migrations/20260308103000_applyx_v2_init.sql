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

create or replace function public.set_updated_at_camelcase()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public.session (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now()),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references public."user"(id) on delete cascade
);

create table if not exists public.account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references public."user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public.verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id text primary key references public."user"(id) on delete cascade,
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
  user_id text not null references public."user"(id) on delete cascade,
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
  user_id text not null references public."user"(id) on delete cascade,
  company_name text,
  job_title text,
  raw_text text not null,
  parsed_data jsonb,
  source_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tailored_resumes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references public."user"(id) on delete cascade,
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
  user_id text not null references public."user"(id) on delete cascade,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists session_user_id_idx on public.session ("userId");
create index if not exists account_user_id_idx on public.account ("userId");
create unique index if not exists account_provider_account_idx on public.account ("providerId", "accountId");
create index if not exists verification_identifier_idx on public.verification (identifier);
create index if not exists profiles_plan_idx on public.profiles (plan);
create index if not exists master_resumes_user_id_idx on public.master_resumes (user_id, created_at desc);
create index if not exists job_descriptions_user_id_idx on public.job_descriptions (user_id, created_at desc);
create index if not exists tailored_resumes_user_id_idx on public.tailored_resumes (user_id, created_at desc);
create index if not exists usage_log_user_id_idx on public.usage_log (user_id, created_at desc);

drop trigger if exists set_user_updated_at on public."user";
create trigger set_user_updated_at
before update on public."user"
for each row
execute procedure public.set_updated_at_camelcase();

drop trigger if exists set_session_updated_at on public.session;
create trigger set_session_updated_at
before update on public.session
for each row
execute procedure public.set_updated_at_camelcase();

drop trigger if exists set_account_updated_at on public.account;
create trigger set_account_updated_at
before update on public.account
for each row
execute procedure public.set_updated_at_camelcase();

drop trigger if exists set_verification_updated_at on public.verification;
create trigger set_verification_updated_at
before update on public.verification
for each row
execute procedure public.set_updated_at_camelcase();

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
