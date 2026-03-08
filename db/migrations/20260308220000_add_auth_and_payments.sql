do $$
begin
  if exists (
    select 1
    from pg_type
    where typname = 'usage_action'
  ) then
    alter type public.usage_action add value if not exists 'login';
    alter type public.usage_action add value if not exists 'purchase';
  end if;
end
$$;

alter table public.users
add column if not exists password_hash text;

update public.users
set password_hash = coalesce(password_hash, '')
where password_hash is null;

alter table public.users
alter column password_hash set not null;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.master_resumes
alter column file_url drop not null;

alter table public.master_resumes
alter column storage_provider set default 'database';

alter table public.tailored_resumes
add column if not exists changes jsonb not null default '[]'::jsonb;

alter table public.tailored_resumes
alter column storage_provider set default 'database';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_tier public.plan_tier not null,
  amount_inr integer not null check (amount_inr > 0),
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sessions_user_id_idx on public.sessions (user_id, expires_at desc);
create index if not exists payments_user_id_idx on public.payments (user_id, created_at desc);

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute procedure public.set_updated_at();
