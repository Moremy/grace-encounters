# Supabase migrations and SQL-Editor-first workflow

Phase 0 deferred all schema changes; Phase 1 introduces them via paste-ready
SQL files committed under `supabase/migrations/`. Until pooler and direct-URL
connectivity from local machines is reliable, those SQL files are the source
of truth for the database schema. Prisma stays in sync as a typed client,
generated offline from `prisma/schema.prisma`.

## Why SQL Editor first

`pnpm prisma migrate dev` and `pnpm db:push` hang against the Supabase pooler
on some networks, which blocks local development end to end. The repo
therefore ships hand-authored, idempotent SQL files that paste cleanly into
the Supabase SQL Editor. `prisma/schema.prisma` mirrors those files exactly,
and `pnpm prisma generate` produces the typed `@prisma/client` from the
schema alone (no DB connection required). When pooler or direct-URL
connectivity is restored, `prisma db pull` and `prisma migrate diff`
reconcile the two sides; until then, the SQL files are authoritative for the
database and the schema file is authoritative for the application's types.

## How to apply migrations

1. Open the Supabase Dashboard for your project and choose `SQL Editor`.
2. Open `supabase/migrations/0001_init_profiles.sql` in your editor of
   choice, copy the entire file, paste it into a new query in the Supabase
   SQL Editor, and run.
3. Verify with the queries at the bottom of the file (the `-- Verification:`
   block). You should see the profiles policies and the `on_auth_user_created`
   and `on_auth_user_updated` triggers listed.
4. Repeat for `supabase/migrations/0002_testimonies.sql` and then
   `supabase/migrations/0003_audit_log.sql`. Each file is idempotent and safe
   to re-run; if a previous attempt partially succeeded, re-running it is the
   correct recovery.
5. `supabase/migrations/0004_seed_admin.sql` is documentation, not auto-applied.
   To promote a launch admin, run the `select id, email, ... from auth.users`
   helper at the top, copy the chosen UUID into the parameterized
   `update public.profiles set role = 'ADMIN' ...` statement, and run only
   that line.

## Keeping Prisma in sync

- After pulling the branch, run `pnpm prisma generate` to refresh
  `@prisma/client` from `prisma/schema.prisma`. No DB connection is needed.
- When pooler or direct-URL connectivity is restored, run `pnpm prisma db pull`
  to re-derive the schema from the live database. The result should match
  `prisma/schema.prisma`; if it does not, the SQL files drifted and must be
  updated to converge.
- `prisma migrate diff` (with the appropriate `--from-*` and `--to-*` flags)
  is the long-term way to detect drift between SQL and schema. Phase 1 does
  not adopt it as part of CI.

## Promoting an admin

```sql
select id, email, created_at from auth.users order by created_at desc limit 5;

update public.profiles
   set role = 'ADMIN',
       "updatedAt" = now()
 where id = '00000000-0000-0000-0000-000000000000'; -- replace with the chosen UUID
```

The same one-liner lives at the bottom of
`supabase/migrations/0004_seed_admin.sql` for copy/paste convenience.

## Drift policy

New tables or columns are added in a NEW numbered SQL file under
`supabase/migrations/` AND mirrored in `prisma/schema.prisma` in the same
commit. Never edit a migration that has already been applied to a shared
environment; create a new one and let it run idempotently. The
`prisma/schema.prisma` file remains the typed surface for the application,
and the SQL files remain authoritative for the database.

## RLS posture and DATABASE_URL roles

- The `@supabase/ssr` clients (browser, server, middleware) hit the database
  through PostgREST with the requester's JWT, so they are governed by RLS.
  Anonymous reads of testimonies are limited by the `testimonies_public_read`
  policy to approved + published rows; authors and moderators see more via
  their own policies.
- The Prisma client uses `DATABASE_URL`, which on Supabase typically resolves
  to the `postgres` superuser role through the pooler. That role bypasses
  RLS by design. Server actions therefore enforce authorization in
  TypeScript via `requireRole` (`src/lib/auth/require-role.ts`); the SQL RLS
  policies are the second line of defense for any path that ever reaches the
  database via the `@supabase/ssr` clients.
- Future work (post Phase 1): switch Prisma to the `service_role` connection
  string for explicit intent, or move read-only paths onto an
  `authenticator`/RLS-respecting connection. Recorded here so the next
  engineer does not have to rediscover the trade-off.
- Author withdraw is now covered by an RLS delete policy
  (`testimonies_author_delete_own`, gated to `submitted`/`in_review`/
  `needs_revision`), so the testimony domain no longer assumes the
  postgres-role bypass for any author-facing action.

_See [docs/PRODUCT_PLAN.md](../docs/PRODUCT_PLAN.md) for module roadmap and phase prioritization._
