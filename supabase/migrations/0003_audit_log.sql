-- Migration: 0003_audit_log
-- Purpose: Create public.audit_log for moderation/admin actions. Inserts
--          happen via server actions running with the postgres role (which
--          bypasses RLS). Reads are admin-only via RLS.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. public.audit_log table
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  "actorId"    uuid references public.profiles(id) on delete set null,
  action       text not null,
  "targetType" text not null,
  "targetId"   uuid not null,
  metadata     jsonb not null default '{}'::jsonb,
  "createdAt"  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------
-- Look up every action ever taken against a given (targetType, targetId).
create index if not exists audit_log_target_idx
  on public.audit_log ("targetType", "targetId");

-- Look up everything an actor did, most recent first.
create index if not exists audit_log_actor_createdat_idx
  on public.audit_log ("actorId", "createdAt" desc);

-- ---------------------------------------------------------------------------
-- 3. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- 4. RLS policy: admin-only read
-- ---------------------------------------------------------------------------
-- No insert/update/delete policy; writes happen through the postgres role
-- (Prisma) which bypasses RLS. is_admin is defined in 0001_init_profiles.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'audit_log'
       and policyname = 'audit_log_admin_read'
  ) then
    execute $sql$
      create policy audit_log_admin_read
        on public.audit_log
        for select
        using (public.is_admin(auth.uid()))
    $sql$;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Verification (uncomment and run in the SQL Editor to confirm the migration)
-- ---------------------------------------------------------------------------
-- select policyname from pg_policies where schemaname='public' and tablename='audit_log';
