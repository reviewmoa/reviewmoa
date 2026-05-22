create extension if not exists pgcrypto;

alter table public.categories
  alter column color set default '#64748b',
  alter column emoji set default '#',
  alter column display_order set default 999;

alter table public.tags
  add column if not exists normalized_name text generated always as (
    lower(regexp_replace(name, '\s+', '', 'g'))
  ) stored;

create unique index if not exists tags_normalized_name_key
  on public.tags (normalized_name);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text generated always as (lower(email)) stored,
  created_at timestamptz not null default now()
);

alter table public.admin_users
  add column if not exists normalized_email text generated always as (lower(email)) stored;

create unique index if not exists admin_users_email_key
  on public.admin_users (normalized_email);

create table if not exists public.pull_requests (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  pr_number integer not null,
  pr_url text not null,
  requester text not null,
  title text,
  state text,
  merged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, pr_number)
);

create table if not exists public.review_sources (
  id uuid primary key default gen_random_uuid(),
  pull_request_id uuid not null references public.pull_requests(id) on delete cascade,
  source_type text not null check (source_type in ('review_comment', 'review_body', 'issue_comment')),
  github_comment_id text not null,
  github_url text,
  reviewer text,
  path text,
  diff_hunk text,
  body text not null,
  is_resolved boolean,
  is_outdated boolean,
  is_minimized boolean,
  minimized_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.review_bundles (
  id uuid primary key default gen_random_uuid(),
  pull_request_id uuid not null references public.pull_requests(id) on delete cascade,
  topic text not null,
  source_ids uuid[] not null default '{}',
  conversation_count integer not null default 0 check (conversation_count >= 0),
  prompt_input jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  requested_by text,
  pr_start integer not null check (pr_start > 0),
  pr_end integer not null check (pr_end > 0),
  excluded_pr_numbers integer[] not null default '{}',
  status text not null default 'pending' check (
    status in ('pending', 'running', 'completed', 'failed', 'partial_failed')
  ),
  total_pr_count integer not null default 0 check (total_pr_count >= 0),
  success_pr_count integer not null default 0 check (success_pr_count >= 0),
  failed_pr_count integer not null default 0 check (failed_pr_count >= 0),
  result_card_count integer not null default 0 check (result_card_count >= 0),
  error_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pr_start <= pr_end)
);

create table if not exists public.generation_job_items (
  id uuid primary key default gen_random_uuid(),
  generation_job_id uuid not null references public.generation_jobs(id) on delete cascade,
  pull_request_id uuid references public.pull_requests(id) on delete set null,
  pr_number integer not null check (pr_number > 0),
  status text not null default 'pending' check (
    status in ('pending', 'running', 'completed', 'failed', 'skipped')
  ),
  card_count integer not null default 0 check (card_count >= 0),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (generation_job_id, pr_number)
);

alter table public.review_cards
  add column if not exists pull_request_id uuid references public.pull_requests(id) on delete set null,
  add column if not exists reviewer_ids text[] not null default '{}',
  add column if not exists rule text,
  add column if not exists markdown text,
  add column if not exists source_pr_url text;

create unique index if not exists review_cards_source_key_key
  on public.review_cards (source_key);

create index if not exists review_cards_pull_request_id_idx
  on public.review_cards (pull_request_id);

create index if not exists review_cards_mission_pr_number_idx
  on public.review_cards (mission_id, pr_number);

create unique index if not exists review_card_tags_card_tag_key
  on public.review_card_tags (review_card_id, tag_id);

create index if not exists pull_requests_mission_pr_number_idx
  on public.pull_requests (mission_id, pr_number);

create index if not exists review_sources_pull_request_id_idx
  on public.review_sources (pull_request_id);

create index if not exists review_bundles_pull_request_id_idx
  on public.review_bundles (pull_request_id);

create index if not exists generation_jobs_status_created_at_idx
  on public.generation_jobs (status, created_at desc);

create index if not exists generation_job_items_job_status_idx
  on public.generation_job_items (generation_job_id, status);

alter table public.admin_users enable row level security;
alter table public.pull_requests enable row level security;
alter table public.review_sources enable row level security;
alter table public.review_bundles enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generation_job_items enable row level security;

grant select on public.pull_requests to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'pull_requests'
      and policyname = 'public can read pull request metadata'
  ) then
    create policy "public can read pull request metadata"
      on public.pull_requests
      for select
      using (true);
  end if;
end $$;
