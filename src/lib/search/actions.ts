'use server';

import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchResult {
  type: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
}

// ---------------------------------------------------------------------------
// Global search
// ---------------------------------------------------------------------------

export async function globalSearch(
  query: string,
  type?: string,
): Promise<SearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const limit = 50;

  if (type && type !== 'all') {
    switch (type) {
      case 'testimonies':
        return searchTestimonies(query);
      case 'devotionals':
        return searchDevotionals(query);
      case 'blog':
        return searchBlogArticles(query);
      case 'groups':
        return searchGroups(query);
      case 'events':
        return searchEvents(query);
      case 'media':
        return searchMedia(query);
      case 'sermons':
        return searchSermons(query);
      default:
        return [];
    }
  }

  // Search all types
  const [testimonies, devotionals, blog, groups, events, media, sermons] =
    await Promise.all([
      searchTestimonies(query),
      searchDevotionals(query),
      searchBlogArticles(query),
      searchGroups(query),
      searchEvents(query),
      searchMedia(query),
      searchSermons(query),
    ]);

  const allResults = [
    ...testimonies,
    ...devotionals,
    ...blog,
    ...groups,
    ...events,
    ...media,
    ...sermons,
  ];

  // Sort by date descending
  allResults.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return allResults.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Individual search functions
// ---------------------------------------------------------------------------

export async function searchTestimonies(query: string): Promise<SearchResult[]> {
  const results = await prisma.testimony.findMany({
    where: {
      title: { contains: query, mode: 'insensitive' },
      status: { in: ['APPROVED', 'FEATURED'] },
    },
    select: {
      title: true,
      excerpt: true,
      slug: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    type: 'testimonies',
    title: r.title,
    excerpt: r.excerpt,
    url: `/testimonies/${r.slug}`,
    date: r.createdAt.toISOString(),
  }));
}

export async function searchDevotionals(query: string): Promise<SearchResult[]> {
  const results = await prisma.devotional.findMany({
    where: {
      title: { contains: query, mode: 'insensitive' },
      status: 'PUBLISHED',
    },
    select: {
      title: true,
      excerpt: true,
      slug: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    type: 'devotionals',
    title: r.title,
    excerpt: r.excerpt,
    url: `/devotionals/${r.slug}`,
    date: r.createdAt.toISOString(),
  }));
}

export async function searchBlogArticles(query: string): Promise<SearchResult[]> {
  const results = await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      title: true,
      excerpt: true,
      slug: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    type: 'blog',
    title: r.title,
    excerpt: r.excerpt,
    url: `/blog/${r.slug}`,
    date: r.createdAt.toISOString(),
  }));
}

export async function searchGroups(query: string): Promise<SearchResult[]> {
  const results = await prisma.communityGroup.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      name: true,
      description: true,
      slug: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    type: 'groups',
    title: r.name,
    excerpt: r.description.slice(0, 150),
    url: `/community/${r.slug}`,
    date: r.createdAt.toISOString(),
  }));
}

export async function searchEvents(query: string): Promise<SearchResult[]> {
  const results = await prisma.event.findMany({
    where: {
      title: { contains: query, mode: 'insensitive' },
      status: 'PUBLISHED',
    },
    select: {
      title: true,
      description: true,
      slug: true,
      date: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { date: 'desc' },
  });

  return results.map((r) => ({
    type: 'events',
    title: r.title,
    excerpt: r.description.slice(0, 150),
    url: `/events/${r.slug}`,
    date: r.createdAt.toISOString(),
  }));
}

export async function searchMedia(query: string): Promise<SearchResult[]> {
  const results = await prisma.mediaItem.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      title: true,
      description: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { publishedAt: 'desc' },
  });

  return results.map((r) => ({
    type: 'media',
    title: r.title,
    excerpt: r.description.slice(0, 150),
    url: `/media/${r.slug}`,
    date: (r.publishedAt ?? r.createdAt).toISOString(),
  }));
}

export async function searchSermons(query: string): Promise<SearchResult[]> {
  const results = await prisma.sermon.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      title: true,
      description: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
    take: 20,
    orderBy: { publishedAt: 'desc' },
  });

  return results.map((r) => ({
    type: 'sermons',
    title: r.title,
    excerpt: r.description.slice(0, 150),
    url: `/sermons/${r.slug}`,
    date: (r.publishedAt ?? r.createdAt).toISOString(),
  }));
}
