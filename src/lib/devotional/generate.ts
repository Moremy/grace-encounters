import Groq from 'groq-sdk';

import { prisma } from '@/lib/prisma';
import { slugify } from './utils';

// ---------------------------------------------------------------------------
// AI-generated daily devotional
//
// Each day the system generates a single devotional that every visitor sees.
// The result is cached in the database (one Devotional row per day), so the
// Groq API is called at most once per day rather than on every page load.
// ---------------------------------------------------------------------------

/**
 * Themes are rotated using the calendar date so that every visitor sees the
 * same theme on the same day, and the rotation is deterministic / reproducible.
 */
const THEMES = [
  'Faith',
  'Healing',
  'Grace',
  'Identity in Christ',
  'Salt and Light',
  'Hope',
  'Prayer',
  "God's Word",
  'Worship',
  'Surrender',
] as const;

const MODEL = 'llama-3.1-8b-instant';

type DevotionalWithAuthor = Awaited<
  ReturnType<typeof findTodaysDevotional>
>;

/**
 * The shape we ask the model to return. Kept flat and simple so a plain
 * `messages.create` call with JSON-in-the-prompt is reliable to parse.
 */
interface GeneratedDevotional {
  scripture: string;
  scriptureReference: string;
  title: string;
  excerpt: string;
  teaching: string;
  prayer: string;
}

/**
 * Returns the UTC start (00:00:00) and end (next day 00:00:00) for the given
 * date. Using UTC keeps the "one per day" boundary stable regardless of the
 * server's local timezone (e.g. Vercel runs in UTC).
 */
function getUtcDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/**
 * Picks the theme for a given date. Uses the absolute day number (days since
 * the Unix epoch) modulo the theme count so the rotation advances by one each
 * day and is identical for everyone on a given calendar day.
 */
function getThemeForDate(date: Date): string {
  const { start } = getUtcDayBounds(date);
  const epochDay = Math.floor(start.getTime() / 86_400_000);
  return THEMES[((epochDay % THEMES.length) + THEMES.length) % THEMES.length];
}

/**
 * Looks up an already-generated (or manually published) devotional whose
 * publishDate falls on the given day. Includes the author so the result has
 * the same shape the marketing pages expect.
 */
function findTodaysDevotional(date: Date) {
  const { start, end } = getUtcDayBounds(date);
  return prisma.devotional.findFirst({
    where: {
      status: 'PUBLISHED',
      publishDate: { gte: start, lt: end },
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishDate: 'desc' },
  });
}

/**
 * Resolves the author to attribute generated devotionals to. Prefers the
 * earliest admin; falls back to the earliest profile of any role. Returns null
 * when the database has no profiles at all (e.g. a fresh install).
 */
async function resolveAuthorId(): Promise<string | null> {
  // The live database stores `role` as a text column rather than a Postgres
  // enum, so Prisma's typed `where: { role: 'ADMIN' }` filter fails. Use raw
  // SQL to match against the text value directly. `profiles` / "createdAt"
  // are the mapped table and column names (see prisma/schema.prisma).
  const adminResult = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM public.profiles WHERE role = 'ADMIN' ORDER BY "createdAt" ASC LIMIT 1
  `;
  const admin = adminResult[0] ?? null;
  if (admin) return admin.id;

  const anyResult = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM public.profiles ORDER BY "createdAt" ASC LIMIT 1
  `;
  const anyProfile = anyResult[0] ?? null;
  return anyProfile?.id ?? null;
}

/**
 * Extracts the first JSON object from a model response, tolerating Markdown
 * code fences or stray prose around the JSON.
 */
function parseGeneratedDevotional(raw: string): GeneratedDevotional | null {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    const { scripture, scriptureReference, title, excerpt, teaching, prayer } =
      parsed as Partial<GeneratedDevotional>;

    if (
      typeof scripture !== 'string' ||
      typeof scriptureReference !== 'string' ||
      typeof title !== 'string' ||
      typeof excerpt !== 'string' ||
      typeof teaching !== 'string' ||
      typeof prayer !== 'string'
    ) {
      return null;
    }

    return { scripture, scriptureReference, title, excerpt, teaching, prayer };
  } catch {
    return null;
  }
}

/**
 * Combines the teaching paragraphs and the closing prayer into the single
 * `content` field stored on the Devotional, with a clearly delineated prayer.
 */
function formatContent(generated: GeneratedDevotional): string {
  return `${generated.teaching.trim()}\n\n---\n\nPrayer\n\n${generated.prayer.trim()}`;
}

/**
 * Calls the Groq API to generate a devotional for the given theme.
 * Returns null if the API key is missing or the response can't be parsed.
 */
async function generateWithGroq(
  theme: string,
): Promise<GeneratedDevotional | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error(
      '[devotional/generate] GROQ_API_KEY is not set; skipping generation.',
    );
    return null;
  }

  const client = new Groq({ apiKey });

  const system = [
    'You are a devotional writer for "Light Bearers," a Christ-centered ministry.',
    'Write warm, biblically grounded daily devotionals that encourage and disciple readers.',
    'Always ground the teaching in Scripture, stay theologically sound, and keep an encouraging, pastoral tone.',
    'Respond with a single JSON object and nothing else — no Markdown, no commentary, no code fences.',
  ].join(' ');

  const user = [
    `Write today's devotional on the theme: "${theme}".`,
    '',
    'Return a JSON object with exactly these string fields:',
    '- "scripture": the full text of one relevant Bible verse (do not include the reference here).',
    '- "scriptureReference": the reference for that verse, e.g. "John 3:16".',
    '- "title": a short, compelling title for the devotional.',
    '- "excerpt": a 2-3 sentence summary that previews the devotional.',
    '- "teaching": the main teaching, 3-4 paragraphs of biblical reflection. Separate paragraphs with blank lines.',
    '- "prayer": a short closing prayer of 2-4 sentences.',
    '',
    'Respond with only the JSON object.',
  ].join('\n');

  try {
    const result = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      // Force valid, complete JSON — llama-3.1-8b-instant otherwise often
      // omits the closing brace, which makes parseGeneratedDevotional fail.
      response_format: { type: 'json_object' },
    });
    const text = result.choices[0]?.message?.content;
    if (!text) return null;
    return parseGeneratedDevotional(text);
  } catch (e) {
    console.error('generateDailyDevotional error:', e);
    return null;
  }
}

/**
 * Returns today's devotional, generating and caching it on first call of the
 * day. If a devotional already exists for today (generated earlier or created
 * manually by an admin) it is returned without calling the AI.
 *
 * Returns null only when no devotional exists for today AND one could not be
 * generated (missing API key, no author in the database, AI/parse failure).
 */
export async function generateDailyDevotional(): Promise<DevotionalWithAuthor> {
  const now = new Date();

  // 1. Already have one for today? Return it without spending an AI call.
  const existing = await findTodaysDevotional(now);
  if (existing) return existing;

  // 2. Need an author to attribute the devotional to.
  const authorId = await resolveAuthorId();
  if (!authorId) {
    console.error(
      '[devotional/generate] No profile found to author the devotional.',
    );
    return null;
  }

  // 3. Generate via the Groq API.
  const theme = getThemeForDate(now);
  const generated = await generateWithGroq(theme);
  if (!generated) return null;

  // 4. Persist as a published devotional dated today, then return it.
  try {
    return await prisma.devotional.create({
      data: {
        slug: slugify(generated.title),
        title: generated.title,
        content: formatContent(generated),
        scripture: generated.scripture,
        scriptureReference: generated.scriptureReference,
        excerpt: generated.excerpt,
        authorId,
        status: 'PUBLISHED',
        publishDate: now,
      },
      include: {
        author: { select: { displayName: true } },
      },
    });
  } catch (e) {
    // A race (two requests generating at once) can collide. Fall back to
    // whatever now exists for today rather than surfacing an error.
    console.error('generateDailyDevotional error:', e);
    return findTodaysDevotional(now);
  }
}
