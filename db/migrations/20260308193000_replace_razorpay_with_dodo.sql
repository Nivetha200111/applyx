begin;

alter table public.users
  alter column billing_provider set default 'dodo';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'razorpay_customer_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'billing_customer_id'
  ) then
    alter table public.users rename column razorpay_customer_id to billing_customer_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'razorpay_subscription_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'billing_subscription_id'
  ) then
    alter table public.users rename column razorpay_subscription_id to billing_subscription_id;
  end if;
end
$$;

alter table public.users
  add column if not exists billing_customer_id text,
  add column if not exists billing_subscription_id text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'razorpay_order_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'provider_checkout_id'
  ) then
    alter table public.payments rename column razorpay_order_id to provider_checkout_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'razorpay_payment_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'provider_payment_id'
  ) then
    alter table public.payments rename column razorpay_payment_id to provider_payment_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'razorpay_signature'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'provider_signature'
  ) then
    alter table public.payments rename column razorpay_signature to provider_signature;
  end if;
end
$$;

alter table public.payments
  add column if not exists billing_provider text not null default 'dodo',
  add column if not exists provider_checkout_id text,
  add column if not exists provider_payment_id text,
  add column if not exists provider_subscription_id text,
  add column if not exists provider_customer_id text,
  add column if not exists provider_signature text,
  add column if not exists provider_event_type text,
  add column if not exists payment_metadata jsonb;

alter table public.payments
  alter column provider_checkout_id drop not null;

alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded'));

drop index if exists public.payments_order_id_idx;

create index if not exists payments_checkout_id_idx
on public.payments (provider_checkout_id);

create unique index if not exists payments_provider_payment_id_key
on public.payments (provider_payment_id);

create index if not exists payments_subscription_id_idx
on public.payments (provider_subscription_id, created_at desc);

commit;
