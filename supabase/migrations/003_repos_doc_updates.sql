-- Repos table: tracks which GitHub repositories users have connected.
create table if not exists public.repos (
  id uuid primary key default gen_random_uuid(),
  github_repo_id bigint not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  doc_paths text[] not null default array['README.md'],
  doc_mode text not null default 'public' check (doc_mode in ('internal', 'public', 'both')),
  created_at timestamp with time zone not null default now()
);

alter table public.repos enable row level security;

create policy "Users can read their own repos"
  on public.repos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own repos"
  on public.repos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own repos"
  on public.repos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own repos"
  on public.repos for delete
  using (auth.uid() = user_id);

-- Doc updates table: logs every documentation update attempt.
create table if not exists public.doc_updates (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references public.repos(id) on delete cascade,
  github_pr_number integer not null,
  github_pr_title text,
  doc_pr_url text,
  status text not null check (status in ('generated', 'skipped', 'error')),
  error_message text,
  created_at timestamp with time zone not null default now()
);

alter table public.doc_updates enable row level security;

create policy "Users can read their own doc updates"
  on public.doc_updates for select
  using (
    exists (
      select 1 from public.repos
      where repos.id = doc_updates.repo_id
        and repos.user_id = auth.uid()
    )
  );

create policy "Users can insert doc updates for their repos"
  on public.doc_updates for insert
  with check (
    exists (
      select 1 from public.repos
      where repos.id = doc_updates.repo_id
        and repos.user_id = auth.uid()
    )
  );

-- Add plan column to profiles (defaults to free).
alter table public.profiles
  add column if not exists plan text not null default 'free';
