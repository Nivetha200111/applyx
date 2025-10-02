create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  resume_data jsonb,
  skills text[],
  experience_years int,
  desired_roles text[],
  salary_min int,
  salary_max int,
  locations text[],
  remote_preference text
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  platform text,
  external_id text,
  title text,
  company text,
  description text,
  salary_range jsonb,
  location text,
  posted_at timestamptz,
  url text,
  unique(platform, external_id)
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  job_id uuid references jobs(id),
  status text,
  applied_at timestamptz default now(),
  customized_resume_url text,
  cover_letter text,
  platform_response jsonb
);

alter table users enable row level security;
alter table profiles enable row level security;
alter table applications enable row level security;


