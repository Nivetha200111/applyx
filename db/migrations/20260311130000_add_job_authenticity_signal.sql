alter table public.tracked_applications
  add column if not exists authenticity_score integer check (
    authenticity_score is null or authenticity_score between 0 and 100
  ),
  add column if not exists authenticity_assessment jsonb,
  add column if not exists authenticity_checked_at timestamptz;
