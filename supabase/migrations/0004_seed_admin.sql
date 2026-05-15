-- Migration: 0004_seed_admin
-- Purpose: One-shot helper to promote an existing auth.users row to ADMIN.
--          DO NOT run blindly. Inspect auth.users first, then uncomment and
--          edit the parameterized update with the target user's UUID.
-- Idempotent: safe to re-run.
-- Re-running with the same UUID is a no-op.

-- Step 1: list the most recently created auth users so you can pick the
-- launch admin's UUID without leaving the SQL Editor.
-- select id, email, created_at from auth.users order by created_at desc limit 5;

-- Step 2: paste the chosen UUID below, uncomment, and run.
-- update public.profiles
--    set role = 'ADMIN',
--        "updatedAt" = now()
--  where id = '00000000-0000-0000-0000-000000000000';

-- Verification:
-- select id, email, role from public.profiles where role = 'ADMIN';

-- This file replaces the need to run 'pnpm db:seed' while the local Prisma pooler connection is unavailable. Once pooler connectivity is restored, prisma/seed.ts is the supported path.
