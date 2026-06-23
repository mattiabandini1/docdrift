-- Add full_name to repos for display in dashboard
alter table public.repos add column if not exists full_name text;
