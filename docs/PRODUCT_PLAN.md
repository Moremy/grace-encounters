# Grace Encounters - Product Plan

Grace Encounters is a Christ-centered platform where every public surface reads like a sanctuary. Testimonies, prayer, devotionals, and pastoral writing are held in a quiet, premium space, reviewed before they are shared. This document is the contract for what the platform becomes as each phase ships.

## Module roadmap

The platform is composed of nine modules. Phase 1 ships the data and seam layer for the first of these (Testimonies); the rest land in priority order on top of the same auth, role, and audit foundations.

- Homepage: the quiet front door, surfacing a featured testimony, scripture, and a call to share.
- Testimonies: user submissions of encounters with Jesus, reviewed before publication.
- Blog: long-form devotional and pastoral writing curated by editors.
- Books: a curated library of recommended Christ-centered reading with reflection prompts.
- Events: in-person and online gatherings (worship nights, prayer rooms, retreats).
- Media: video and audio (sermons, worship sets, testimony recordings).
- News: announcements and ministry updates.
- Community: prayer wall, intercession, and small-group connections.
- Giving: a transparent path for supporters to underwrite the ministry.

## Navigation

The planned top-level navigation menu, in order, is: Home, Testimonies, Blog, Books, Events, Media, News, Community, Giving. The live navigation in Phase 1 still only links to internal anchors on the marketing page; full module navigation lights up incrementally as each module ships, so the menu never points at a route that does not yet exist.

## Phase prioritization

This list mirrors and expands the README roadmap. It is the working order; later phases may be reshuffled by editorial demand, but the prerequisites (auth, roles, moderation) do not move.

1. Phase 0 - Scaffolding (complete on main).
2. Phase 1 - Auth-to-app seam, testimony domain (data layer only), moderation audit log. SQL-Editor-first workflow.
3. Phase 1.5 - Auth UI (sign-in / sign-up / magic link / reset) and the first testimony submission and moderation pages.
4. Phase 2 - Public testimony reading surfaces (list, detail, search, category and scripture filters).
5. Phase 3 - Prayer wall and intercession.
6. Phase 4 - Devotionals and series.
7. Phase 5+ - Blog, Books, Events, Media, News, Giving in priority order driven by editorial demand.

## Editorial and tone guardrails

Every user-facing copy decision is a tone decision. The voice is reverent, premium, and quiet; it never performs urgency or trades on outrage. Sample copy committed to the repository is always labeled as sample (in code comments, fixture filenames, or inline notes) so it cannot be mistaken for a real submission. Fabricated testimonies and fabricated prayers are forbidden in production code paths and seed data; placeholders must read as placeholders.

## Drift policy

This document is the source of truth for module ordering and the phase plan. Any pull request that changes module priority, renames a module, reorders the navigation, or shifts a phase must update this file in the same PR. Schema and database drift is tracked separately in `supabase/README.md`, which owns the SQL-Editor-first migration workflow; the two documents are read together.

_Last updated: Phase 1_
