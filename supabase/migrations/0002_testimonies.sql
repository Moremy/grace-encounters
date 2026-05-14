-- Migration: 0002_testimonies
-- Purpose: Create public.testimonies (Phase 1 testimony domain), with
--          quoted-camelCase columns matching prisma/schema.prisma, full-text
--          search index, the shared updatedAt trigger, a status-transition
--          guard trigger, and RLS policies covering public read (approved+
--          published only), author read/write of their own drafts, and
--          moderator/admin read+write across all rows.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. public.testimonies table
-- ---------------------------------------------------------------------------
create table if not exists public.testimonies (
  id              uuid primary key default gen_random_uuid(),
  "authorId"      uuid references public.profiles(id) on delete set null,
  title           text not null,
  slug            text unique,
  category        text not null
                  check (category in (
                    'salvation',
                    'healing',
                    'deliverance',
                    'provision',
                    'restoration',
                    'miracle',
                    'answered_prayer',
                    'other'
                  )),
  body            text not null,
  "scriptureRefs" text[] not null default '{}',
  "coverImageUrl" text,
  "isAnonymous"   boolean not null default false,
  status          text not null default 'submitted'
                  check (status in (
                    'draft',
                    'submitted',
                    'in_review',
                    'needs_revision',
                    'approved',
                    'rejected'
                  )),
  "isPublished"   boolean not null default false,
  "isFeatured"    boolean not null default false,
  "reviewedById"  uuid references public.profiles(id) on delete set null,
  "reviewedAt"    timestamptz,
  "reviewNote"    text,
  "publishedAt"   timestamptz,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------
-- Moderation queue lookups: most recent submitted/in_review first.
create index if not exists testimonies_status_createdat_idx
  on public.testimonies (status, "createdAt");

-- Public reading surface: most recently published first.
create index if not exists testimonies_published_publishedat_idx
  on public.testimonies ("isPublished", "publishedAt" desc);

-- Category filters on the public list.
create index if not exists testimonies_category_idx
  on public.testimonies (category);

-- Full-text search. Expression GIN index keeps the table schema simple; if
-- heavy search load arrives, migrate to a generated tsvector column in a
-- later migration.
create index if not exists testimonies_search_idx
  on public.testimonies
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,'')));

-- ---------------------------------------------------------------------------
-- 3. updatedAt trigger
-- ---------------------------------------------------------------------------
drop trigger if exists set_testimonies_updated_at on public.testimonies;
create trigger set_testimonies_updated_at
  before update on public.testimonies
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Publish guard trigger
-- ---------------------------------------------------------------------------
-- Fills publishedAt at the moment of approve+publish, requires a slug at
-- that point, and refuses to revert a still-published row back to a
-- pre-approval status without an explicit unpublish.
create or replace function public.tg_testimonies_publish_guard()
returns trigger
language plpgsql
as $$
begin
  -- When transitioning to approved + published, fill required fields.
  if new.status = 'approved' and new."isPublished" = true then
    if new."publishedAt" is null then
      new."publishedAt" := now();
    end if;
    if new.slug is null then
      raise exception 'testimonies.slug must be set before approve+publish (id=%)', new.id;
    end if;
  end if;

  -- An approved+published row cannot revert to draft without explicit unpublish.
  if (old.status = 'approved' and old."isPublished" = true)
     and (new.status in ('draft','submitted','needs_revision'))
     and new."isPublished" = true then
    raise exception 'cannot transition published testimony to % while still published (id=%)', new.status, new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists tg_testimonies_publish_guard on public.testimonies;
create trigger tg_testimonies_publish_guard
  before update on public.testimonies
  for each row execute function public.tg_testimonies_publish_guard();

-- ---------------------------------------------------------------------------
-- 5. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.testimonies enable row level security;

-- ---------------------------------------------------------------------------
-- 6. RLS policies
-- ---------------------------------------------------------------------------
-- Every CREATE POLICY is wrapped in a pg_policies guard so re-running this
-- file does not error on duplicate. No delete policy: admins delete via the
-- service role.

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'testimonies'
       and policyname = 'testimonies_public_read'
  ) then
    execute $sql$
      create policy testimonies_public_read
        on public.testimonies
        for select
        to anon, authenticated
        using ("isPublished" = true and status = 'approved')
    $sql$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'testimonies'
       and policyname = 'testimonies_author_read_own'
  ) then
    execute $sql$
      create policy testimonies_author_read_own
        on public.testimonies
        for select
        to authenticated
        using (auth.uid() = "authorId")
    $sql$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'testimonies'
       and policyname = 'testimonies_moderator_read_all'
  ) then
    execute $sql$
      create policy testimonies_moderator_read_all
        on public.testimonies
        for select
        to authenticated
        using (public.is_moderator(auth.uid()))
    $sql$;
  end if;
end
$$;

-- Author insert: brand new submissions only. The WITH CHECK pins every
-- moderation-controlled field to its initial state so a malicious client
-- cannot self-publish or self-feature.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'testimonies'
       and policyname = 'testimonies_author_insert'
  ) then
    execute $sql$
      create policy testimonies_author_insert
        on public.testimonies
        for insert
        to authenticated
        with check (
          auth.uid() = "authorId"
          and status = 'submitted'
          and "isPublished" = false
          and "isFeatured" = false
          and "reviewedById" is null
          and "reviewedAt" is null
          and "publishedAt" is null
        )
    $sql$;
  end if;
end
$$;

-- Author update: only their own row, only while it is still in a pre-review
-- state. The WITH CHECK keeps publish/feature flags off and constrains the
-- allowed status transitions.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'testimonies'
       and policyname = 'testimonies_author_update_own'
  ) then
    execute $sql$
      create policy testimonies_author_update_own
        on public.testimonies
        for update
        to authenticated
        using (
          auth.uid() = "authorId"
          and status in ('draft','needs_revision')
        )
        with check (
          auth.uid() = "authorId"
          and status in ('draft','submitted','needs_revision')
          and "isPublished" = false
          and "isFeatured" = false
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
       and tablename = 'testimonies'
       and policyname = 'testimonies_moderator_update_all'
  ) then
    execute $sql$
      create policy testimonies_moderator_update_all
        on public.testimonies
        for update
        to authenticated
        using (public.is_moderator(auth.uid()))
        with check (public.is_moderator(auth.uid()))
    $sql$;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Verification (uncomment and run in the SQL Editor to confirm the migration)
-- ---------------------------------------------------------------------------
-- select id, status, "isPublished" from public.testimonies limit 5;
-- select policyname from pg_policies where schemaname='public' and tablename='testimonies';
-- explain (costs off) select * from public.testimonies where to_tsvector('english', title || ' ' || body) @@ plainto_tsquery('english', 'grace');
