// ---------------------------------------------------------------------------
// AI Client Abstraction
// ---------------------------------------------------------------------------

import { AI_CONFIG, isAIEnabled } from './config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

interface CompletionResult {
  content: string;
}

/**
 * Generate a chat completion using the configured OpenAI-compatible API.
 * Returns null when AI is disabled (no API key or feature flag off).
 */
export async function generateCompletion(
  options: CompletionOptions,
): Promise<CompletionResult | null> {
  if (!isAIEnabled()) {
    return null;
  }

  const { messages, maxTokens, temperature } = options;

  try {
    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        max_tokens: maxTokens ?? AI_CONFIG.maxTokens,
        temperature: temperature ?? AI_CONFIG.temperature,
      }),
    });

    if (!response.ok) {
      console.error(
        `[AI Client] Completion failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    return { content };
  } catch (error) {
    console.error('[AI Client] Completion error:', error);
    return null;
  }
}

/**
 * Generate an embedding vector for the given text.
 * Returns null when AI is disabled.
 */
export async function generateEmbedding(
  text: string,
): Promise<number[] | null> {
  if (!isAIEnabled()) {
    return null;
  }

  try {
    const response = await fetch(`${AI_CONFIG.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      console.error(
        `[AI Client] Embedding failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return data?.data?.[0]?.embedding ?? null;
  } catch (error) {
    console.error('[AI Client] Embedding error:', error);
    return null;
  }
}
