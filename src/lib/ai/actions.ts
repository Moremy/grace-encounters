'use server';

import { generateCompletion } from './client';
import { isAIEnabled } from './config';
import {
  SCRIPTURE_RECOMMENDATION_PROMPT,
  DEVOTIONAL_SUGGESTION_PROMPT,
  TESTIMONY_CATEGORIZATION_PROMPT,
  SEARCH_ENHANCEMENT_PROMPT,
  CONTENT_RECOMMENDATION_PROMPT,
} from './prompts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScriptureVerse {
  reference: string;
  text: string;
  relevance: string;
}

export interface DevotionalSuggestion {
  theme: string;
  description: string;
  scriptureBase: string;
  reason: string;
}

export interface TestimonyCategorization {
  category: string;
  tags: string[];
  confidence: number;
  reasoning: string;
}

export interface SearchEnhancement {
  originalQuery: string;
  expandedTerms: string[];
  relatedTopics: string[];
}

export interface ContentRecommendation {
  type: 'testimony' | 'devotional' | 'sermon';
  reason: string;
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Fallback data for graceful degradation
// ---------------------------------------------------------------------------

const FALLBACK_VERSES: ScriptureVerse[] = [
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    relevance: 'A reminder of God\'s good plans for your life.',
  },
  {
    reference: 'Psalm 46:10',
    text: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
    relevance: 'An invitation to rest in God\'s sovereignty.',
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all this through him who gives me strength.',
    relevance: 'Encouragement that God provides strength for every challenge.',
  },
];

const FALLBACK_DEVOTIONAL_SUGGESTIONS: DevotionalSuggestion[] = [
  {
    theme: 'Walking in Faith',
    description: 'Exploring what it means to trust God in uncertain times.',
    scriptureBase: 'Hebrews 11:1',
    reason: 'A foundational topic for spiritual growth.',
  },
  {
    theme: 'The Power of Prayer',
    description: 'Deepening your prayer life and experiencing God\'s presence.',
    scriptureBase: 'Philippians 4:6-7',
    reason: 'Prayer is central to the Christian walk.',
  },
  {
    theme: 'God\'s Grace',
    description: 'Understanding and living in the fullness of God\'s grace.',
    scriptureBase: 'Ephesians 2:8-9',
    reason: 'Grace is the foundation of our relationship with God.',
  },
];

const FALLBACK_CATEGORIZATION: TestimonyCategorization = {
  category: 'FAITH',
  tags: ['testimony', 'faith', 'growth'],
  confidence: 0,
  reasoning: 'AI categorization is currently unavailable. Please select a category manually.',
};

const FALLBACK_SEARCH_ENHANCEMENT: SearchEnhancement = {
  originalQuery: '',
  expandedTerms: [],
  relatedTopics: [],
};

const FALLBACK_RECOMMENDATIONS: ContentRecommendation[] = [
  {
    type: 'devotional',
    reason: 'Start your day with spiritual nourishment.',
    keywords: ['devotional', 'daily', 'scripture'],
  },
  {
    type: 'testimony',
    reason: 'Be encouraged by stories of faith.',
    keywords: ['testimony', 'faith', 'encouragement'],
  },
  {
    type: 'sermon',
    reason: 'Deepen your understanding of God\'s Word.',
    keywords: ['sermon', 'teaching', 'bible'],
  },
];

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Get AI-powered scripture recommendations based on user context/mood.
 * Returns fallback verses when AI is disabled.
 */
export async function getScriptureRecommendations(
  context: string,
): Promise<ScriptureVerse[]> {
  if (!isAIEnabled()) {
    return FALLBACK_VERSES;
  }

  const result = await generateCompletion({
    messages: [
      { role: 'system', content: SCRIPTURE_RECOMMENDATION_PROMPT },
      { role: 'user', content: context },
    ],
  });

  if (!result) {
    return FALLBACK_VERSES;
  }

  try {
    const parsed = JSON.parse(result.content);
    return parsed.verses ?? FALLBACK_VERSES;
  } catch {
    return FALLBACK_VERSES;
  }
}

/**
 * Get AI-powered devotional suggestions based on user reading history.
 * Returns fallback suggestions when AI is disabled.
 */
export async function getDevotionalSuggestions(
  userId: string,
): Promise<DevotionalSuggestion[]> {
  if (!isAIEnabled()) {
    return FALLBACK_DEVOTIONAL_SUGGESTIONS;
  }

  const result = await generateCompletion({
    messages: [
      { role: 'system', content: DEVOTIONAL_SUGGESTION_PROMPT },
      {
        role: 'user',
        content: `Suggest devotional themes for user ${userId}. Consider general spiritual growth topics suitable for a church community member.`,
      },
    ],
  });

  if (!result) {
    return FALLBACK_DEVOTIONAL_SUGGESTIONS;
  }

  try {
    const parsed = JSON.parse(result.content);
    return parsed.suggestions ?? FALLBACK_DEVOTIONAL_SUGGESTIONS;
  } catch {
    return FALLBACK_DEVOTIONAL_SUGGESTIONS;
  }
}

/**
 * Auto-categorize testimony content using AI.
 * Returns a fallback categorization when AI is disabled.
 */
export async function categorizeTestimony(
  content: string,
): Promise<TestimonyCategorization> {
  if (!isAIEnabled()) {
    return FALLBACK_CATEGORIZATION;
  }

  const result = await generateCompletion({
    messages: [
      { role: 'system', content: TESTIMONY_CATEGORIZATION_PROMPT },
      {
        role: 'user',
        content: `Please categorize the following testimony:\n\n${content}`,
      },
    ],
  });

  if (!result) {
    return FALLBACK_CATEGORIZATION;
  }

  try {
    const parsed = JSON.parse(result.content);
    return {
      category: parsed.category ?? 'FAITH',
      tags: parsed.tags ?? [],
      confidence: parsed.confidence ?? 0,
      reasoning: parsed.reasoning ?? '',
    };
  } catch {
    return FALLBACK_CATEGORIZATION;
  }
}

/**
 * Enhance a search query with related biblical/spiritual terms.
 * Returns empty enhancement when AI is disabled.
 */
export async function enhanceSearch(
  query: string,
): Promise<SearchEnhancement> {
  if (!isAIEnabled()) {
    return { ...FALLBACK_SEARCH_ENHANCEMENT, originalQuery: query };
  }

  const result = await generateCompletion({
    messages: [
      { role: 'system', content: SEARCH_ENHANCEMENT_PROMPT },
      {
        role: 'user',
        content: `Expand the following search query with related biblical and spiritual terms: "${query}"`,
      },
    ],
    maxTokens: 256,
  });

  if (!result) {
    return { ...FALLBACK_SEARCH_ENHANCEMENT, originalQuery: query };
  }

  try {
    const parsed = JSON.parse(result.content);
    return {
      originalQuery: query,
      expandedTerms: parsed.expandedTerms ?? [],
      relatedTopics: parsed.relatedTopics ?? [],
    };
  } catch {
    return { ...FALLBACK_SEARCH_ENHANCEMENT, originalQuery: query };
  }
}

/**
 * Get personalized content recommendations for a user.
 * Returns fallback recommendations when AI is disabled.
 */
export async function getContentRecommendations(
  userId: string,
): Promise<ContentRecommendation[]> {
  if (!isAIEnabled()) {
    return FALLBACK_RECOMMENDATIONS;
  }

  const result = await generateCompletion({
    messages: [
      { role: 'system', content: CONTENT_RECOMMENDATION_PROMPT },
      {
        role: 'user',
        content: `Generate personalized content recommendations for user ${userId}. Suggest a mix of testimonies, devotionals, and sermons.`,
      },
    ],
  });

  if (!result) {
    return FALLBACK_RECOMMENDATIONS;
  }

  try {
    const parsed = JSON.parse(result.content);
    return parsed.recommendations ?? FALLBACK_RECOMMENDATIONS;
  } catch {
    return FALLBACK_RECOMMENDATIONS;
  }
}
