# Supabase Phase 1 backlog

Phase 0 ships the `Profile` table and the `@supabase/ssr` client triplet, but the
mechanism that keeps `auth.users` and `public.profiles` in lockstep at runtime
is intentionally deferred to Phase 1. This file is the audit trail so the next
phase does not silently miss it.

## TODO Phase 1: SQL migration for `public.profiles`

Add `supabase/migrations/0000_init.sql` (committed, formatted, idempotent
where reasonable) covering all of the following. Today none of it is wired up
in the repository.

### 1. Foreign key from `profiles` to `auth.users`

`prisma/schema.prisma` documents that `Profile.id String @id @db.Uuid` mirrors
`auth.users.id`, but Prisma cannot express the FK across schemas. Add it in
SQL:

```sql
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id)
  on delete cascade;
```

### 2. `on_auth_user_created` trigger

Without this, the first sign-up creates an `auth.users` row with no matching
`profiles` row. Every `prisma.profile.findUnique({ where: { id: user.id } })`
returns `null`, and every role helper resolves to `false`.

```sql
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
```

### 3. Email sync trigger

`prisma/schema.prisma` makes `email String @unique` on `Profile` while
documenting that the canonical email lives in Supabase `auth.users`. If a user
updates their email in Supabase, `profiles.email` drifts. The Phase 1
migration must add an `on_auth_user_updated` trigger that mirrors email
changes back into `public.profiles`, or mark the column as derived/cached.

```sql
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
  for each row execute function public.handle_auth_user_email_change();
```

### 4. RLS policy stub

Phase 0 leaves RLS off; that is fine for an empty schema but unsafe the moment
any user-owned data lands. The Phase 1 migration must:

```sql
alter table public.profiles enable row level security;

-- TODO Phase 2: tighten. This is a permissive baseline that lets any signed-in
-- user read their own row and update non-privileged columns. Admin reads/writes
-- happen through service-role server code, not RLS.
create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

The role column must NOT be self-updatable; either move privilege escalation
behind a server-only RPC or add a column-level policy in the same migration.

## TODO Phase 1: helpers and hooks

These were called out in the v1 review as "silent omissions" that will save
Phase 1 friction:

- `src/lib/supabase/use-supabase.ts` (or `use-supabase-client.ts`): a tiny
  `'use client'` hook that memoizes `createClient()` so consumers do not
  rebuild the browser client on every render.
- `src/lib/auth/get-current-profile.ts`: a typed server helper that joins
  `supabase.auth.getUser()` to `prisma.profile.findUnique` and returns
  `Profile | null`. Every Phase 1 RSC will need it.
- `prisma/migrations/`: committed (even initially empty after the first
  `prisma migrate dev`) so new contributors do not run a bare schema push by
  accident.

## TODO Phase 1: layout consumes the validated env

`src/app/layout.tsx` currently reads `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`,
duplicating the default that already lives in `src/lib/env.ts`. Once the env
loader is consumed beyond fail-fast validation, swap the metadataBase to read
`env.NEXT_PUBLIC_SITE_URL` directly so the default lives in one place.
