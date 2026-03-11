do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'amount_inr'
  ) then
    alter table public.payments rename column amount_inr to amount;
  end if;
end
$$;

alter table public.payments
  alter column amount type numeric(12, 2) using amount::numeric(12, 2),
  alter column currency set default 'USD';
