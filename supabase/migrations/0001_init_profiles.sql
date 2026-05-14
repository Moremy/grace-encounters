-- Migration: 0001_init_profiles
-- Purpose: Create public.profiles, link it to auth.users, install the
--          on_auth_user_created and on_auth_user_updated triggers, expose
--          the reusable tg_set_updated_at trigger function, define the
--          is_admin / is_moderator security-definer helpers used by later
--          migrations, and enable owner-scoped + admin-bypass RLS.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
-- pgcrypto exposes gen_random_uuid(), used as a default by 0002_testimonies
-- and 0003_audit_log. We enable it here so the dependency is explicit and
-- the later migrations stay self-contained.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 2. Reusable updatedAt trigger function
-- ---------------------------------------------------------------------------
-- Shared by every table that owns an "updatedAt" column. Defined once here
-- so 0002 and 0003 can simply attach a BEFORE UPDATE trigger that calls it.
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. public.profiles table
-- ---------------------------------------------------------------------------
-- The Profile.id is the same UUID as auth.users.id. We do not default the
-- id; the on_auth_user_created trigger inserts the matching row at sign-up.
create table if not exists public.profiles (
  id          uuid primary key,
  email       text not null unique,
  "displayName" text,
  "avatarUrl"   text,
  role        text not null default 'USER'
              check (role in ('USER','MODERATOR','ADMIN')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. FK from public.profiles.id to auth.users(id)
-- ---------------------------------------------------------------------------
-- Prisma cannot express cross-schema FKs, so we add it here. Guarded by a
-- pg_constraint lookup so re-running the file does not error.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'profiles_id_fkey'
       and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users(id)
      on delete cascade;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- 6. updatedAt trigger on public.profiles
-- ---------------------------------------------------------------------------
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. handle_new_auth_user: create the public.profiles row at sign-up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, "createdAt", "updatedAt")
  values (new.id, new.email, now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- 8. handle_auth_user_email_change: mirror auth.users.email back to profiles
-- ---------------------------------------------------------------------------
-- profiles.email is a cached mirror of auth.users.email; this keeps it in
-- sync when a user changes their email through Supabase Auth.
create or replace function public.handle_auth_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
       set email = new.email,
           "updatedAt" = now()
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.handle_auth_user_email_change();

-- ---------------------------------------------------------------------------
-- 9. Role helper functions
-- ---------------------------------------------------------------------------
-- These are referenced by the RLS policies in 0002_testimonies and
-- 0003_audit_log. is_moderator returns true for admins as well, matching the
-- rank-based contract documented in src/lib/auth/roles.ts.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles p
     where p.id = uid
       and p.role = 'ADMIN'
  );
$$;

create or replace function public.is_moderator(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles p
     where p.id = uid
       and p.role in ('MODERATOR','ADMIN')
  );
$$;

-- ---------------------------------------------------------------------------
-- 10. Enable RLS on public.profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- 11. RLS policies
-- ---------------------------------------------------------------------------
-- Each policy is wrapped in a pg_policies guard so re-running this file does
-- not error on duplicate. The inner CREATE POLICY string is dollar-quoted so
-- single quotes pass through cleanly.

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'profiles'
       and policyname = 'profiles_self_select'
  ) then
    execute $sql$
      create policy profiles_self_select
        on public.profiles
        for select
        using (auth.uid() = id)
    $sql$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'profiles'
       and policyname = 'profiles_admin_select'
  ) then
    execute $sql$
      create policy profiles_admin_select
        on public.profiles
        for select
        using (public.is_admin(auth.uid()))
    $sql$;
  end if;
end
$$;

-- profiles_self_update blocks role escalation: the WITH CHECK clause requires
-- the new role to equal the row's existing role as stored in public.profiles.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'profiles'
       and policyname = 'profiles_self_update'
  ) then
    execute $sql$
      create policy profiles_self_update
        on public.profiles
        for update
        using (auth.uid() = id)
        with check (
          auth.uid() = id
          and role = (select role from public.profiles where id = auth.uid())
        )
    $sql$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'profiles'
       and policyname = 'profiles_admin_update'
  ) then
    execute $sql$
      create policy profiles_admin_update
        on public.profiles
        for update
        using (public.is_admin(auth.uid()))
        with check (public.is_admin(auth.uid()))
    $sql$;
  end if;
end
$$;

-- Service role bypasses RLS by default. Server-side code that uses
-- DATABASE_URL with the postgres role also bypasses RLS; those paths must
-- enforce authorization in TypeScript.

-- ---------------------------------------------------------------------------
-- Verification (uncomment and run in the SQL Editor to confirm the migration)
-- ---------------------------------------------------------------------------
-- select id, email, role from public.profiles limit 5;
-- select tgname from pg_trigger where tgname in ('on_auth_user_created','on_auth_user_updated','set_profiles_updated_at');
-- select policyname from pg_policies where schemaname='public' and tablename='profiles';
