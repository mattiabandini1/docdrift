-- Add notification_email to profiles for user notification preferences
alter table public.profiles add column if not exists notification_email text;
