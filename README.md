# Light Bearers

Real encounters with Jesus. Shared in reverence. Held in prayer.

> Then they overcame him by the blood of the Lamb and by the word of their testimony. - Revelation 12:11

## About

Light Bearers is a Christ-centered platform for testimonies, prayer requests, and devotionals. Every submission is reviewed before publication, so the space stays reverent in tone, language, and intent. The design is quiet and premium, written to feel more like a sanctuary than a feed.

## Tech stack

- Next.js 14 (App Router)
- TypeScript 5
- Tailwind CSS 3
- shadcn/ui
- Prisma 5
- Supabase (Auth, Postgres, Storage)
- Framer Motion
- Vercel

## Prerequisites

- Node 22 (use `nvm use`)
- pnpm 9
- A Supabase project with Database and Auth enabled

## Quick start

```bash
pnpm install
cp .env.example .env.local
# fill in Supabase + database values
pnpm prisma generate
pnpm prisma migrate dev
# Optional: seed a launch admin. Requires SEED_ADMIN_EMAIL + SEED_ADMIN_ID.
# Create the launch admin in the Supabase Auth dashboard first, then copy
# that user's UUID into SEED_ADMIN_ID before running the seed script.
pnpm db:seed
pnpm dev
```

## Project structure

```
.
+-- prisma/
|   +-- schema.prisma
|   +-- seed.ts
+-- public/
+-- src/
|   +-- app/
|   |   +-- (marketing)/      # public landing experience
|   |   +-- (auth)/           # sign-in, sign-up, magic link, reset
|   |   +-- (app)/            # authenticated member area
|   |   +-- admin/            # moderation and admin tooling
|   |   +-- api/              # route handlers
|   +-- components/
|   |   +-- ui/               # shadcn primitives
|   |   +-- brand/            # wordmark and brand pieces
|   |   +-- marketing/        # landing sections
|   |   +-- layout/           # site header and footer
|   +-- lib/
|       +-- supabase/         # browser, server, middleware clients
|       +-- auth/             # role helpers
|       +-- prisma.ts
|       +-- env.ts
|       +-- utils.ts
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server. |
| `pnpm build` | Build the production bundle. |
| `pnpm start` | Run the built app in production mode. |
| `pnpm lint` | Lint the codebase with Next.js ESLint. |
| `pnpm format` | Format files with Prettier. |
| `pnpm typecheck` | Run the TypeScript compiler in no-emit mode. |
| `pnpm prisma:generate` | Generate the Prisma client from the schema. |
| `pnpm prisma:migrate` | Create and apply a development migration. |
| `pnpm prisma:studio` | Open Prisma Studio against the configured database. |
| `pnpm db:push` | Push the current schema to the database without migrations. |
| `pnpm db:seed` | Seed the database using `prisma/seed.ts`. |

## Design language

The sanctuary palette pairs ivory and deep navy with accents of warm gold and muted olive. Headings are set in Fraunces, a contemporary serif with quiet warmth, balanced by Inter for body copy. The result is cinematic, peaceful, and premium.

## Roadmap

This repository is Phase 0: the scaffolding pass. Subsequent phases build on top of it.

- Phase 1: Database and role model
- Phase 2: Authentication (sign-in, sign-up, magic link, password reset)
- Phase 3: Testimonies (submission, moderation, publication)
- Phase 4: Prayer wall and intercession
- Phase 5: Devotionals and series
- Phase 6: Admin tooling and audit log

> Note on Phase 0 commits: two of the eleven scaffolding commits carry slightly
> off subjects relative to their diffs (the design tokens shipped with the
> App Router scaffold rather than the later UI-primitives commit, and the route
> group placeholders shipped before the auth helpers commit named them). The
> content is complete and history was preserved as-is. See the v1 review notes
> in `.agents/tasks/task-phase-0-scaffold/` for the audit trail.

## Contributing

Submitted testimonies are reviewed before publishing. Please be reverent in tone, language, and intent.

## License

MIT. See [LICENSE](./LICENSE).
