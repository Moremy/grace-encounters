Reserved for Phase 2: Supabase Auth flows (sign-in, sign-up, magic link, password reset). Intentionally empty in Phase 0.

`requireUser` and `requireRole` redirect unauthenticated callers to `/sign-in`; that route lands in Phase 1.5 alongside the moderation UI.
