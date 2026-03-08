create table if not exists public.request_rate_limits (
  route_key text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (route_key, identifier_hash)
);

create index if not exists request_rate_limits_window_idx
on public.request_rate_limits (window_started_at);

drop trigger if exists set_request_rate_limits_updated_at on public.request_rate_limits;
create trigger set_request_rate_limits_updated_at
before update on public.request_rate_limits
for each row
execute procedure public.set_updated_at();
