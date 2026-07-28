-- 003_fix_prayer_requests_updated_at_trigger.sql
--
-- The generic set_updated_at() trigger function assigns NEW.updated_at, but
-- prayer_requests uses a camelCase "updatedAt" column (Prisma-managed via
-- @updatedAt). The trigger therefore made EVERY UPDATE on prayer_requests
-- fail with: record "new" has no field "updated_at" — breaking the
-- "I prayed for this" button and admin approve/reject of prayer requests.
--
-- Prisma already maintains "updatedAt" on every update, so the trigger is
-- redundant here. Drop it.

DROP TRIGGER IF EXISTS set_prayer_requests_updated_at ON public.prayer_requests;
