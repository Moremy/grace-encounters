// ---------------------------------------------------------------------------
// AI Configuration
// ---------------------------------------------------------------------------

export const AI_CONFIG = {
  /** OpenAI-compatible API base URL */
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  /** API key for authentication */
  apiKey: process.env.OPENAI_API_KEY || '',
  /** Model to use for completions */
  model: process.env.AI_MODEL || 'gpt-4o-mini',
  /** Explicit feature flag (defaults to true when API key is present) */
  enabled: process.env.AI_ENABLED !== 'false',
  /** Max tokens for completions */
  maxTokens: 1024,
  /** Temperature for generation */
  temperature: 0.7,
} as const;

/**
 * Returns true if AI features are enabled and properly configured.
 * AI is enabled when:
 * 1. AI_ENABLED is not explicitly set to 'false'
 * 2. OPENAI_API_KEY is present and non-empty
 */
export function isAIEnabled(): boolean {
  return AI_CONFIG.enabled && AI_CONFIG.apiKey.length > 0;
}
