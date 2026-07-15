-- 002_books.sql — Books library: uploaded PDFs + reading suggestions
-- Run against the Supabase database (applied via prisma db execute or the SQL editor).

-- Enum ------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "BookStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "books" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "author"      TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "fileUrl"     TEXT,
  "externalUrl" TEXT,
  "status"      "BookStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdById" UUID NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "books_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "books_status_idx" ON "books" ("status");

-- Storage bucket for uploaded book PDFs ----------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access; uploads restricted to authenticated users (the
-- admin-only gate is enforced in the createBook server action).
DO $$ BEGIN
  CREATE POLICY "books_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'books');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "books_authenticated_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'books');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
