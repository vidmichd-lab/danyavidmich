/**
 * AI Configuration
 * 
 * Set OPENAI_API_KEY environment variable to enable AI content generation
 * Or use other AI providers (Anthropic, etc.)
 */

export interface AIConfig {
  provider: "openai" | "anthropic" | "local" | "none";
  apiKey?: string;
  model?: string;
  enabled: boolean;
}

export function getAIConfig(): AIConfig {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const provider = process.env.AI_PROVIDER as AIConfig["provider"] || "openai";
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  
  return {
    provider,
    apiKey,
    model,
    enabled: Boolean(apiKey) && provider !== "none",
  };
}

