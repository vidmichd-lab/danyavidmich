/**
 * AI Configuration
 * 
 * Supports OpenAI and Yandex GPT
 * 
 * For OpenAI: set OPENAI_API_KEY
 * For Yandex GPT: set YANDEX_API_KEY and YANDEX_FOLDER_ID
 */

export interface AIConfig {
  provider: "openai" | "yandex" | "anthropic" | "local" | "none";
  apiKey?: string;
  folderId?: string; // For Yandex GPT
  model?: string;
  enabled: boolean;
}

export function getAIConfig(): AIConfig {
  const yandexApiKey = process.env.YANDEX_API_KEY;
  const yandexFolderId = process.env.YANDEX_FOLDER_ID;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  // Auto-detect provider based on available keys
  let provider: AIConfig["provider"] = "none";
  let apiKey: string | undefined;
  let folderId: string | undefined;
  
  if (yandexApiKey && yandexFolderId) {
    provider = "yandex";
    apiKey = yandexApiKey;
    folderId = yandexFolderId;
  } else if (openaiApiKey) {
    provider = "openai";
    apiKey = openaiApiKey;
  } else {
    // Check explicit provider setting
    const explicitProvider = process.env.AI_PROVIDER as AIConfig["provider"];
    if (explicitProvider) {
      provider = explicitProvider;
      apiKey = process.env.AI_API_KEY;
    }
  }
  
  const model = process.env.AI_MODEL || (provider === "yandex" ? "yandexgpt" : "gpt-4o-mini");
  
  return {
    provider,
    apiKey,
    folderId,
    model,
    enabled: Boolean(apiKey) && provider !== "none",
  };
}

