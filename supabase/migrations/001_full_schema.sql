-- =============================================================================
-- Light and Salt - Full PostgreSQL Migration
-- Generated from prisma/schema.prisma (38 models, 24 enums)
-- Safe for existing Supabase database (uses IF NOT EXISTS / DO blocks)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "GroupCategory" AS ENUM ('PRAYER', 'BIBLE_STUDY', 'WORSHIP', 'FELLOWSHIP', 'OUTREACH', 'YOUTH', 'WOMEN', 'MEN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BlogCategory" AS ENUM ('DEVOTIONAL_THOUGHT', 'FAITH_LIVING', 'TESTIMONY_REFLECTION', 'CHURCH_NEWS', 'MISSIONS', 'PRAYER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BlogArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('PRAYER_REPLY', 'TESTIMONY_APPROVED', 'GROUP_INVITATION', 'EVENT_REMINDER', 'GENERAL', 'MESSAGE_RECEIVED', 'DONATION_RECEIVED', 'PRAYER_ROOM_STARTING', 'BIBLE_STUDY_REMINDER', 'TESTIMONY_FEATURED', 'SERMON_PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TestimonyMediaType" AS ENUM ('TEXT', 'PDF', 'AUDIO', 'VIDEO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TestimonyCategory" AS ENUM ('HEALING', 'SALVATION', 'DELIVERANCE', 'PROVISION', 'RESTORATION', 'FAITH', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MediaType" AS ENUM ('SERMON_AUDIO', 'SERMON_VIDEO', 'WORSHIP_AUDIO', 'VIDEO_MESSAGE', 'PDF_RESOURCE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MediaCategory" AS ENUM ('SERMON', 'WORSHIP', 'TEACHING', 'TESTIMONY', 'CONFERENCE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MPESA', 'PAYPAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MessageMediaType" AS ENUM ('IMAGE', 'FILE', 'AUDIO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TestimonyStatus" AS ENUM ('PENDING', 'APPROVED', 'NEEDS_REVISION', 'REJECTED', 'FEATURED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PrayerRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'ANSWERED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PrayerVisibility" AS ENUM ('PUBLIC', 'ANONYMOUS', 'PRIVATE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DevotionalStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LiveStreamStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LiveStreamType" AS ENUM ('WORSHIP', 'SERMON', 'EVENT', 'SPECIAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AIRecommendationType" AS ENUM ('SCRIPTURE', 'DEVOTIONAL', 'CONTENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'BOUNCED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- Profiles
CREATE TABLE IF NOT EXISTS "profiles" (
  "id"          UUID PRIMARY KEY,
  "email"       TEXT NOT NULL,
  "displayName" TEXT,
  "avatarUrl"   TEXT,
  "bio"         TEXT,
  "role"        "Role" NOT NULL DEFAULT 'USER',
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_email_key" UNIQUE ("email")
);
CREATE INDEX IF NOT EXISTS "profiles_role_idx" ON "profiles" ("role");

-- Testimonies
CREATE TABLE IF NOT EXISTS "testimonies" (
  "id"           TEXT PRIMARY KEY,
  "slug"         TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "content"      TEXT NOT NULL,
  "excerpt"      TEXT NOT NULL,
  "authorId"     UUID NOT NULL,
  "status"       "TestimonyStatus" NOT NULL DEFAULT 'PENDING',
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "revisionNote" TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "publishedAt"  TIMESTAMPTZ,
  "mediaType"    "TestimonyMediaType" NOT NULL DEFAULT 'TEXT',
  "mediaUrl"     TEXT,
  "thumbnailUrl" TEXT,
  "category"     "TestimonyCategory",
  "tags"         TEXT[] DEFAULT '{}',
  "fileSize"     INTEGER,
  CONSTRAINT "testimonies_slug_key" UNIQUE ("slug"),
  CONSTRAINT "testimonies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "testimonies_status_idx" ON "testimonies" ("status");
CREATE INDEX IF NOT EXISTS "testimonies_authorId_idx" ON "testimonies" ("authorId");
CREATE INDEX IF NOT EXISTS "testimonies_category_idx" ON "testimonies" ("category");
CREATE INDEX IF NOT EXISTS "testimonies_mediaType_idx" ON "testimonies" ("mediaType");

-- Prayer Requests
CREATE TABLE IF NOT EXISTS "prayer_requests" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "authorId"    UUID NOT NULL,
  "status"      "PrayerRequestStatus" NOT NULL DEFAULT 'PENDING',
  "visibility"  "PrayerVisibility" NOT NULL DEFAULT 'PUBLIC',
  "prayerCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "answeredAt"  TIMESTAMPTZ,
  CONSTRAINT "prayer_requests_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "prayer_requests_status_idx" ON "prayer_requests" ("status");
CREATE INDEX IF NOT EXISTS "prayer_requests_authorId_idx" ON "prayer_requests" ("authorId");

-- Prayer Intercessions
CREATE TABLE IF NOT EXISTS "prayer_intercessions" (
  "id"              TEXT PRIMARY KEY,
  "prayerRequestId" TEXT NOT NULL,
  "userId"          UUID NOT NULL,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "prayer_intercessions_prayerRequestId_userId_key" UNIQUE ("prayerRequestId", "userId"),
  CONSTRAINT "prayer_intercessions_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "prayer_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prayer_intercessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Devotionals
CREATE TABLE IF NOT EXISTS "devotionals" (
  "id"                 TEXT PRIMARY KEY,
  "slug"               TEXT NOT NULL,
  "title"              TEXT NOT NULL,
  "content"            TEXT NOT NULL,
  "scripture"          TEXT NOT NULL,
  "scriptureReference" TEXT NOT NULL,
  "excerpt"            TEXT NOT NULL,
  "authorId"           UUID NOT NULL,
  "status"             "DevotionalStatus" NOT NULL DEFAULT 'DRAFT',
  "featured"           BOOLEAN NOT NULL DEFAULT false,
  "publishDate"        TIMESTAMPTZ,
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "devotionals_slug_key" UNIQUE ("slug"),
  CONSTRAINT "devotionals_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "devotionals_status_idx" ON "devotionals" ("status");
CREATE INDEX IF NOT EXISTS "devotionals_authorId_idx" ON "devotionals" ("authorId");
CREATE INDEX IF NOT EXISTS "devotionals_publishDate_idx" ON "devotionals" ("publishDate");

-- Community Groups
CREATE TABLE IF NOT EXISTS "community_groups" (
  "id"          TEXT PRIMARY KEY,
  "slug"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category"    "GroupCategory" NOT NULL,
  "imageUrl"    TEXT,
  "memberCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "community_groups_slug_key" UNIQUE ("slug")
);

-- Community Group Members
CREATE TABLE IF NOT EXISTS "community_group_members" (
  "id"       TEXT PRIMARY KEY,
  "groupId"  TEXT NOT NULL,
  "userId"   UUID NOT NULL,
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "community_group_members_groupId_userId_key" UNIQUE ("groupId", "userId"),
  CONSTRAINT "community_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "community_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "community_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Group Discussions
CREATE TABLE IF NOT EXISTS "group_discussions" (
  "id"             TEXT PRIMARY KEY,
  "groupId"        TEXT NOT NULL,
  "authorId"       UUID NOT NULL,
  "title"          TEXT NOT NULL,
  "content"        TEXT NOT NULL,
  "isPrayerThread" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "group_discussions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "community_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "group_discussions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Group Discussion Replies
CREATE TABLE IF NOT EXISTS "group_discussion_replies" (
  "id"           TEXT PRIMARY KEY,
  "discussionId" TEXT NOT NULL,
  "authorId"     UUID NOT NULL,
  "content"      TEXT NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "group_discussion_replies_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "group_discussions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "group_discussion_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Events
CREATE TABLE IF NOT EXISTS "events" (
  "id"          TEXT PRIMARY KEY,
  "slug"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location"    TEXT NOT NULL,
  "date"        TIMESTAMPTZ NOT NULL,
  "endDate"     TIMESTAMPTZ,
  "imageUrl"    TEXT,
  "featured"    BOOLEAN NOT NULL DEFAULT false,
  "status"      "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "createdById" UUID NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "events_slug_key" UNIQUE ("slug"),
  CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "events" ("date");

-- Blog Articles
CREATE TABLE IF NOT EXISTS "blog_articles" (
  "id"          TEXT PRIMARY KEY,
  "slug"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "excerpt"     TEXT NOT NULL,
  "category"    "BlogCategory" NOT NULL,
  "imageUrl"    TEXT,
  "featured"    BOOLEAN NOT NULL DEFAULT false,
  "authorId"    UUID NOT NULL,
  "status"      "BlogArticleStatus" NOT NULL DEFAULT 'DRAFT',
  "publishDate" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "blog_articles_slug_key" UNIQUE ("slug"),
  CONSTRAINT "blog_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "blog_articles_status_idx" ON "blog_articles" ("status");
CREATE INDEX IF NOT EXISTS "blog_articles_authorId_idx" ON "blog_articles" ("authorId");
CREATE INDEX IF NOT EXISTS "blog_articles_category_idx" ON "blog_articles" ("category");

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"        TEXT PRIMARY KEY,
  "userId"    UUID NOT NULL,
  "type"      "NotificationType" NOT NULL,
  "title"     TEXT NOT NULL,
  "message"   TEXT NOT NULL,
  "link"      TEXT,
  "read"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications" ("userId");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications" ("read");

-- Media Playlists
CREATE TABLE IF NOT EXISTS "media_playlists" (
  "id"            TEXT PRIMARY KEY,
  "slug"          TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "category"      "MediaCategory" NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "media_playlists_slug_key" UNIQUE ("slug")
);

-- Media Items
CREATE TABLE IF NOT EXISTS "media_items" (
  "id"           TEXT PRIMARY KEY,
  "slug"         TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "mediaType"    "MediaType" NOT NULL,
  "url"          TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "duration"     INTEGER,
  "fileSize"     INTEGER,
  "category"     "MediaCategory" NOT NULL,
  "playlistId"   TEXT,
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "speakerId"    UUID,
  "publishedAt"  TIMESTAMPTZ,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "media_items_slug_key" UNIQUE ("slug"),
  CONSTRAINT "media_items_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "media_playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "media_items_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "media_items_mediaType_idx" ON "media_items" ("mediaType");
CREATE INDEX IF NOT EXISTS "media_items_category_idx" ON "media_items" ("category");
CREATE INDEX IF NOT EXISTS "media_items_featured_idx" ON "media_items" ("featured");
CREATE INDEX IF NOT EXISTS "media_items_publishedAt_idx" ON "media_items" ("publishedAt");
CREATE INDEX IF NOT EXISTS "media_items_speakerId_idx" ON "media_items" ("speakerId");

-- Sermon Series
CREATE TABLE IF NOT EXISTS "sermon_series" (
  "id"            TEXT PRIMARY KEY,
  "slug"          TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "order"         INTEGER NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "sermon_series_slug_key" UNIQUE ("slug")
);

-- Sermons
CREATE TABLE IF NOT EXISTS "sermons" (
  "id"            TEXT PRIMARY KEY,
  "slug"          TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "scripture"     TEXT,
  "seriesId"      TEXT,
  "speakerId"     UUID NOT NULL,
  "audioUrl"      TEXT,
  "videoUrl"      TEXT,
  "transcriptUrl" TEXT,
  "notesUrl"      TEXT,
  "thumbnailUrl"  TEXT,
  "duration"      INTEGER,
  "featured"      BOOLEAN NOT NULL DEFAULT false,
  "publishedAt"   TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "sermons_slug_key" UNIQUE ("slug"),
  CONSTRAINT "sermons_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "sermon_series"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "sermons_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "sermons_seriesId_idx" ON "sermons" ("seriesId");
CREATE INDEX IF NOT EXISTS "sermons_speakerId_idx" ON "sermons" ("speakerId");
CREATE INDEX IF NOT EXISTS "sermons_featured_idx" ON "sermons" ("featured");
CREATE INDEX IF NOT EXISTS "sermons_publishedAt_idx" ON "sermons" ("publishedAt");

-- Prayer Rooms
CREATE TABLE IF NOT EXISTS "prayer_rooms" (
  "id"              TEXT PRIMARY KEY,
  "slug"            TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "description"     TEXT NOT NULL,
  "scheduledAt"     TIMESTAMPTZ,
  "endAt"           TIMESTAMPTZ,
  "isLive"          BOOLEAN NOT NULL DEFAULT false,
  "createdById"     UUID NOT NULL,
  "maxParticipants" INTEGER NOT NULL DEFAULT 50,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "prayer_rooms_slug_key" UNIQUE ("slug"),
  CONSTRAINT "prayer_rooms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "prayer_rooms_isLive_idx" ON "prayer_rooms" ("isLive");
CREATE INDEX IF NOT EXISTS "prayer_rooms_scheduledAt_idx" ON "prayer_rooms" ("scheduledAt");
CREATE INDEX IF NOT EXISTS "prayer_rooms_createdById_idx" ON "prayer_rooms" ("createdById");

-- Prayer Room Participants
CREATE TABLE IF NOT EXISTS "prayer_room_participants" (
  "id"       TEXT PRIMARY KEY,
  "roomId"   TEXT NOT NULL,
  "userId"   UUID NOT NULL,
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "prayer_room_participants_roomId_userId_key" UNIQUE ("roomId", "userId"),
  CONSTRAINT "prayer_room_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "prayer_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prayer_room_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Prayer Room Messages
CREATE TABLE IF NOT EXISTS "prayer_room_messages" (
  "id"        TEXT PRIMARY KEY,
  "roomId"    TEXT NOT NULL,
  "authorId"  UUID NOT NULL,
  "content"   TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "prayer_room_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "prayer_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "prayer_room_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "prayer_room_messages_roomId_idx" ON "prayer_room_messages" ("roomId");
CREATE INDEX IF NOT EXISTS "prayer_room_messages_authorId_idx" ON "prayer_room_messages" ("authorId");

-- Bible Study Plans
CREATE TABLE IF NOT EXISTS "bible_study_plans" (
  "id"            TEXT PRIMARY KEY,
  "slug"          TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "totalDays"     INTEGER NOT NULL,
  "createdById"   UUID NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "bible_study_plans_slug_key" UNIQUE ("slug"),
  CONSTRAINT "bible_study_plans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "bible_study_plans_createdById_idx" ON "bible_study_plans" ("createdById");

-- Bible Study Days
CREATE TABLE IF NOT EXISTS "bible_study_days" (
  "id"                 TEXT PRIMARY KEY,
  "planId"             TEXT NOT NULL,
  "dayNumber"          INTEGER NOT NULL,
  "title"              TEXT NOT NULL,
  "scripture"          TEXT NOT NULL,
  "scriptureReference" TEXT NOT NULL,
  "reflection"         TEXT,
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "bible_study_days_planId_fkey" FOREIGN KEY ("planId") REFERENCES "bible_study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "bible_study_days_planId_idx" ON "bible_study_days" ("planId");

-- Bible Study Progress
CREATE TABLE IF NOT EXISTS "bible_study_progress" (
  "id"          TEXT PRIMARY KEY,
  "planId"      TEXT NOT NULL,
  "userId"      UUID NOT NULL,
  "dayNumber"   INTEGER NOT NULL,
  "completed"   BOOLEAN NOT NULL DEFAULT false,
  "notes"       TEXT,
  "completedAt" TIMESTAMPTZ,
  CONSTRAINT "bible_study_progress_planId_userId_dayNumber_key" UNIQUE ("planId", "userId", "dayNumber"),
  CONSTRAINT "bible_study_progress_planId_fkey" FOREIGN KEY ("planId") REFERENCES "bible_study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "bible_study_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "bible_study_progress_planId_idx" ON "bible_study_progress" ("planId");
CREATE INDEX IF NOT EXISTS "bible_study_progress_userId_idx" ON "bible_study_progress" ("userId");

-- Scripture Bookmarks
CREATE TABLE IF NOT EXISTS "scripture_bookmarks" (
  "id"        TEXT PRIMARY KEY,
  "userId"    UUID NOT NULL,
  "reference" TEXT NOT NULL,
  "content"   TEXT,
  "note"      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "scripture_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "scripture_bookmarks_userId_idx" ON "scripture_bookmarks" ("userId");

-- Donation Campaigns
CREATE TABLE IF NOT EXISTS "donation_campaigns" (
  "id"            TEXT PRIMARY KEY,
  "slug"          TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "goalAmount"    DECIMAL NOT NULL,
  "currentAmount" DECIMAL NOT NULL DEFAULT 0,
  "imageUrl"      TEXT,
  "active"        BOOLEAN NOT NULL DEFAULT true,
  "startDate"     TIMESTAMPTZ NOT NULL,
  "endDate"       TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "donation_campaigns_slug_key" UNIQUE ("slug")
);
CREATE INDEX IF NOT EXISTS "donation_campaigns_active_idx" ON "donation_campaigns" ("active");

-- Donations
CREATE TABLE IF NOT EXISTS "donations" (
  "id"                    TEXT PRIMARY KEY,
  "donorId"               UUID NOT NULL,
  "amount"                DECIMAL NOT NULL,
  "currency"              TEXT NOT NULL DEFAULT 'USD',
  "provider"              "PaymentProvider" NOT NULL,
  "providerTransactionId" TEXT,
  "campaignId"            TEXT,
  "status"                "DonationStatus" NOT NULL DEFAULT 'PENDING',
  "recurring"             BOOLEAN NOT NULL DEFAULT false,
  "recurringInterval"     TEXT,
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "donations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "donation_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "donations_donorId_idx" ON "donations" ("donorId");
CREATE INDEX IF NOT EXISTS "donations_campaignId_idx" ON "donations" ("campaignId");
CREATE INDEX IF NOT EXISTS "donations_status_idx" ON "donations" ("status");

-- Conversations
CREATE TABLE IF NOT EXISTS "conversations" (
  "id"        TEXT PRIMARY KEY,
  "type"      "ConversationType" NOT NULL,
  "title"     TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversation Participants
CREATE TABLE IF NOT EXISTS "conversation_participants" (
  "id"             TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "userId"         UUID NOT NULL,
  "joinedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastReadAt"     TIMESTAMPTZ,
  CONSTRAINT "conversation_participants_conversationId_userId_key" UNIQUE ("conversationId", "userId"),
  CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Messages
CREATE TABLE IF NOT EXISTS "messages" (
  "id"             TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderId"       UUID NOT NULL,
  "content"        TEXT NOT NULL,
  "mediaUrl"       TEXT,
  "mediaType"      "MessageMediaType",
  "read"           BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "messages_conversationId_idx" ON "messages" ("conversationId");
CREATE INDEX IF NOT EXISTS "messages_senderId_idx" ON "messages" ("senderId");

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id"        TEXT PRIMARY KEY,
  "userId"    UUID NOT NULL,
  "endpoint"  TEXT NOT NULL,
  "p256dh"    TEXT NOT NULL,
  "auth"      TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "push_subscriptions_userId_endpoint_key" UNIQUE ("userId", "endpoint"),
  CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "push_subscriptions_userId_idx" ON "push_subscriptions" ("userId");

-- AI Recommendations
CREATE TABLE IF NOT EXISTS "ai_recommendations" (
  "id"        TEXT PRIMARY KEY,
  "userId"    UUID NOT NULL,
  "type"      "AIRecommendationType" NOT NULL,
  "content"   JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ai_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ai_recommendations_userId_idx" ON "ai_recommendations" ("userId");
CREATE INDEX IF NOT EXISTS "ai_recommendations_type_idx" ON "ai_recommendations" ("type");

-- Live Streams
CREATE TABLE IF NOT EXISTS "live_streams" (
  "id"           TEXT PRIMARY KEY,
  "slug"         TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "streamUrl"    TEXT,
  "thumbnailUrl" TEXT,
  "status"       "LiveStreamStatus" NOT NULL DEFAULT 'SCHEDULED',
  "streamType"   "LiveStreamType" NOT NULL,
  "isPublic"     BOOLEAN NOT NULL DEFAULT true,
  "scheduledAt"  TIMESTAMPTZ,
  "startedAt"    TIMESTAMPTZ,
  "endedAt"      TIMESTAMPTZ,
  "viewerCount"  INTEGER NOT NULL DEFAULT 0,
  "createdById"  UUID NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "live_streams_slug_key" UNIQUE ("slug"),
  CONSTRAINT "live_streams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "live_streams_status_idx" ON "live_streams" ("status");
CREATE INDEX IF NOT EXISTS "live_streams_streamType_idx" ON "live_streams" ("streamType");
CREATE INDEX IF NOT EXISTS "live_streams_scheduledAt_idx" ON "live_streams" ("scheduledAt");
CREATE INDEX IF NOT EXISTS "live_streams_createdById_idx" ON "live_streams" ("createdById");

-- Live Stream Chats
CREATE TABLE IF NOT EXISTS "live_stream_chats" (
  "id"        TEXT PRIMARY KEY,
  "streamId"  TEXT NOT NULL,
  "authorId"  UUID NOT NULL,
  "content"   TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "live_stream_chats_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "live_stream_chats_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "live_stream_chats_streamId_idx" ON "live_stream_chats" ("streamId");
CREATE INDEX IF NOT EXISTS "live_stream_chats_authorId_idx" ON "live_stream_chats" ("authorId");

-- Live Stream Replays
CREATE TABLE IF NOT EXISTS "live_stream_replays" (
  "id"        TEXT PRIMARY KEY,
  "streamId"  TEXT NOT NULL,
  "replayUrl" TEXT NOT NULL,
  "duration"  INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "live_stream_replays_streamId_key" UNIQUE ("streamId"),
  CONSTRAINT "live_stream_replays_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Email Templates
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id"          TEXT PRIMARY KEY,
  "slug"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "subject"     TEXT NOT NULL,
  "htmlContent" TEXT NOT NULL,
  "textContent" TEXT NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "email_templates_slug_key" UNIQUE ("slug")
);

-- Email Logs
CREATE TABLE IF NOT EXISTS "email_logs" (
  "id"             TEXT PRIMARY KEY,
  "recipientId"    UUID,
  "recipientEmail" TEXT NOT NULL,
  "templateSlug"   TEXT NOT NULL,
  "subject"        TEXT NOT NULL,
  "status"         "EmailStatus" NOT NULL DEFAULT 'QUEUED',
  "sentAt"         TIMESTAMPTZ,
  "errorMessage"   TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "email_logs_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "email_logs_recipientId_idx" ON "email_logs" ("recipientId");
CREATE INDEX IF NOT EXISTS "email_logs_status_idx" ON "email_logs" ("status");

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
  "id"             TEXT PRIMARY KEY,
  "email"          TEXT NOT NULL,
  "userId"         UUID,
  "subscribedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "unsubscribedAt" TIMESTAMPTZ,
  "active"         BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "newsletter_subscriptions_email_key" UNIQUE ("email"),
  CONSTRAINT "newsletter_subscriptions_userId_key" UNIQUE ("userId"),
  CONSTRAINT "newsletter_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_active_idx" ON "newsletter_subscriptions" ("active");

-- Notification Preferences
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id"                      TEXT PRIMARY KEY,
  "userId"                  UUID NOT NULL,
  "emailNewsletter"         BOOLEAN NOT NULL DEFAULT true,
  "prayerReminders"         BOOLEAN NOT NULL DEFAULT true,
  "devotionalNotifications" BOOLEAN NOT NULL DEFAULT true,
  "eventReminders"          BOOLEAN NOT NULL DEFAULT true,
  "donationReceipts"        BOOLEAN NOT NULL DEFAULT true,
  "pushEnabled"             BOOLEAN NOT NULL DEFAULT true,
  "createdAt"               TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "notification_preferences_userId_key" UNIQUE ("userId"),
  CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"         TEXT PRIMARY KEY,
  "userId"     UUID,
  "action"     TEXT NOT NULL,
  "resource"   TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata"   JSONB,
  "ipAddress"  TEXT,
  "userAgent"  TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs" ("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs" ("createdAt");

-- Background Jobs
CREATE TABLE IF NOT EXISTS "background_jobs" (
  "id"           TEXT PRIMARY KEY,
  "type"         TEXT NOT NULL,
  "payload"      JSONB NOT NULL,
  "status"       "JobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts"     INTEGER NOT NULL DEFAULT 0,
  "maxAttempts"  INTEGER NOT NULL DEFAULT 3,
  "scheduledFor" TIMESTAMPTZ NOT NULL,
  "startedAt"    TIMESTAMPTZ,
  "completedAt"  TIMESTAMPTZ,
  "error"        TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "background_jobs_status_idx" ON "background_jobs" ("status");
CREATE INDEX IF NOT EXISTS "background_jobs_scheduledFor_idx" ON "background_jobs" ("scheduledFor");
CREATE INDEX IF NOT EXISTS "background_jobs_type_idx" ON "background_jobs" ("type");

-- =============================================================================
-- ALTER TABLE statements for existing tables that may need new columns
-- (safe with IF NOT EXISTS column check pattern)
-- =============================================================================

-- Add new columns to testimonies if they don't exist (for existing databases)
DO $$ BEGIN
  ALTER TABLE "testimonies" ADD COLUMN IF NOT EXISTS "mediaType" "TestimonyMediaType" DEFAULT 'TEXT';
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "testimonies" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "testimonies" ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "testimonies" ADD COLUMN IF NOT EXISTS "category" "TestimonyCategory";
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "testimonies" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "testimonies" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Add bio column to profiles if it doesn't exist
DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "bio" TEXT;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- =============================================================================
-- Supabase Auth Integration
-- (FK from profiles to auth.users, trigger to auto-create profile on sign-up)
-- =============================================================================

-- FK from profiles.id to auth.users.id (ON DELETE CASCADE)
DO $$ BEGIN
  ALTER TABLE "profiles"
    ADD CONSTRAINT "profiles_id_fkey"
    FOREIGN KEY ("id") REFERENCES auth.users("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger function: auto-create profile row on new auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles ("id", "email", "displayName", "role", "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'USER',
    now(),
    now()
  )
  ON CONFLICT ("id") DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first to make idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger function: mirror email updates from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET "email" = NEW.email, "updatedAt" = now()
  WHERE "id" = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_updated();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prayer_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prayer_intercessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "devotionals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "community_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "community_group_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_discussions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_discussion_replies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_playlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sermon_series" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sermons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prayer_rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prayer_room_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prayer_room_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bible_study_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bible_study_days" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bible_study_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scripture_bookmarks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "donation_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "donations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_recommendations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_streams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_stream_chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_stream_replays" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "background_jobs" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS Policies: Profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON "profiles";
CREATE POLICY "profiles_select_own" ON "profiles"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE USING (auth.uid() = "id");

-- ---------------------------------------------------------------------------
-- RLS Policies: Public read for published content
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "testimonies_select_approved" ON "testimonies";
CREATE POLICY "testimonies_select_approved" ON "testimonies"
  FOR SELECT USING ("status" IN ('APPROVED', 'FEATURED') OR "authorId" = auth.uid());

DROP POLICY IF EXISTS "testimonies_insert_own" ON "testimonies";
CREATE POLICY "testimonies_insert_own" ON "testimonies"
  FOR INSERT WITH CHECK ("authorId" = auth.uid());

DROP POLICY IF EXISTS "devotionals_select_published" ON "devotionals";
CREATE POLICY "devotionals_select_published" ON "devotionals"
  FOR SELECT USING ("status" = 'PUBLISHED' OR ("status" = 'SCHEDULED' AND "publishDate" <= now()));

DROP POLICY IF EXISTS "events_select_published" ON "events";
CREATE POLICY "events_select_published" ON "events"
  FOR SELECT USING ("status" = 'PUBLISHED');

DROP POLICY IF EXISTS "blog_articles_select_published" ON "blog_articles";
CREATE POLICY "blog_articles_select_published" ON "blog_articles"
  FOR SELECT USING ("status" = 'PUBLISHED' OR ("status" = 'SCHEDULED' AND "publishDate" <= now()));

DROP POLICY IF EXISTS "community_groups_select_all" ON "community_groups";
CREATE POLICY "community_groups_select_all" ON "community_groups"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "media_items_select_all" ON "media_items";
CREATE POLICY "media_items_select_all" ON "media_items"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sermons_select_published" ON "sermons";
CREATE POLICY "sermons_select_published" ON "sermons"
  FOR SELECT USING ("publishedAt" IS NOT NULL AND "publishedAt" <= now());

DROP POLICY IF EXISTS "live_streams_select_public" ON "live_streams";
CREATE POLICY "live_streams_select_public" ON "live_streams"
  FOR SELECT USING ("isPublic" = true);

DROP POLICY IF EXISTS "donation_campaigns_select_active" ON "donation_campaigns";
CREATE POLICY "donation_campaigns_select_active" ON "donation_campaigns"
  FOR SELECT USING ("active" = true);

-- ---------------------------------------------------------------------------
-- RLS Policies: Owner-scoped access for private data
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_select_own" ON "notifications";
CREATE POLICY "notifications_select_own" ON "notifications"
  FOR SELECT USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON "notifications";
CREATE POLICY "notifications_update_own" ON "notifications"
  FOR UPDATE USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "donations_select_own" ON "donations";
CREATE POLICY "donations_select_own" ON "donations"
  FOR SELECT USING ("donorId" = auth.uid());

DROP POLICY IF EXISTS "donations_insert_own" ON "donations";
CREATE POLICY "donations_insert_own" ON "donations"
  FOR INSERT WITH CHECK ("donorId" = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_select_own" ON "push_subscriptions";
CREATE POLICY "push_subscriptions_select_own" ON "push_subscriptions"
  FOR SELECT USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON "push_subscriptions";
CREATE POLICY "push_subscriptions_insert_own" ON "push_subscriptions"
  FOR INSERT WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON "push_subscriptions";
CREATE POLICY "push_subscriptions_delete_own" ON "push_subscriptions"
  FOR DELETE USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "ai_recommendations_select_own" ON "ai_recommendations";
CREATE POLICY "ai_recommendations_select_own" ON "ai_recommendations"
  FOR SELECT USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "scripture_bookmarks_select_own" ON "scripture_bookmarks";
CREATE POLICY "scripture_bookmarks_select_own" ON "scripture_bookmarks"
  FOR SELECT USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "scripture_bookmarks_insert_own" ON "scripture_bookmarks";
CREATE POLICY "scripture_bookmarks_insert_own" ON "scripture_bookmarks"
  FOR INSERT WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "bible_study_progress_select_own" ON "bible_study_progress";
CREATE POLICY "bible_study_progress_select_own" ON "bible_study_progress"
  FOR SELECT USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "bible_study_progress_insert_own" ON "bible_study_progress";
CREATE POLICY "bible_study_progress_insert_own" ON "bible_study_progress"
  FOR INSERT WITH CHECK ("userId" = auth.uid());

DROP POLICY IF EXISTS "notification_preferences_select_own" ON "notification_preferences";
CREATE POLICY "notification_preferences_select_own" ON "notification_preferences"
  FOR SELECT USING ("userId" = auth.uid());

DROP POLICY IF EXISTS "notification_preferences_upsert_own" ON "notification_preferences";
CREATE POLICY "notification_preferences_upsert_own" ON "notification_preferences"
  FOR ALL USING ("userId" = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS Policies: Messaging (participants only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "conversations_select_participant" ON "conversations";
CREATE POLICY "conversations_select_participant" ON "conversations"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "conversation_participants"
      WHERE "conversation_participants"."conversationId" = "conversations"."id"
        AND "conversation_participants"."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_select_participant" ON "messages";
CREATE POLICY "messages_select_participant" ON "messages"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "conversation_participants"
      WHERE "conversation_participants"."conversationId" = "messages"."conversationId"
        AND "conversation_participants"."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert_participant" ON "messages";
CREATE POLICY "messages_insert_participant" ON "messages"
  FOR INSERT WITH CHECK (
    "senderId" = auth.uid() AND
    EXISTS (
      SELECT 1 FROM "conversation_participants"
      WHERE "conversation_participants"."conversationId" = "messages"."conversationId"
        AND "conversation_participants"."userId" = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: Service role bypass for server actions
-- These allow Prisma (using the service_role key) to perform all operations
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "service_role_all_profiles" ON "profiles";
CREATE POLICY "service_role_all_profiles" ON "profiles"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_testimonies" ON "testimonies";
CREATE POLICY "service_role_all_testimonies" ON "testimonies"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_prayer_requests" ON "prayer_requests";
CREATE POLICY "service_role_all_prayer_requests" ON "prayer_requests"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_devotionals" ON "devotionals";
CREATE POLICY "service_role_all_devotionals" ON "devotionals"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_notifications" ON "notifications";
CREATE POLICY "service_role_all_notifications" ON "notifications"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_donations" ON "donations";
CREATE POLICY "service_role_all_donations" ON "donations"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_messages" ON "messages";
CREATE POLICY "service_role_all_messages" ON "messages"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_live_streams" ON "live_streams";
CREATE POLICY "service_role_all_live_streams" ON "live_streams"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_audit_logs" ON "audit_logs";
CREATE POLICY "service_role_all_audit_logs" ON "audit_logs"
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_background_jobs" ON "background_jobs";
CREATE POLICY "service_role_all_background_jobs" ON "background_jobs"
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- DONE
-- =============================================================================
