-- Add job application tracker table

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

alter type public.usage_action add value if not exists 'parse_tracker_jd';

alter table public.users
  add column if not exists monthly_tracker_parses_used integer not null default 0
    check (monthly_tracker_parses_used >= 0);

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

  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tracked_apps_user_id_idx
  on public.tracked_applications (user_id, created_at desc);
create index if not exists tracked_apps_user_status_idx
  on public.tracked_applications (user_id, status);
create index if not exists tracked_apps_user_archived_idx
  on public.tracked_applications (user_id, is_archived, updated_at desc);
create index if not exists tracked_apps_skills_idx
  on public.tracked_applications using gin (required_skills);

drop trigger if exists set_tracked_applications_updated_at on public.tracked_applications;
create trigger set_tracked_applications_updated_at
before update on public.tracked_applications
for each row
execute procedure public.set_updated_at();
