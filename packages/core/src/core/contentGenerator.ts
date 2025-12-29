/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import { DEFAULT_QWEN_MODEL } from '../config/models.js';
import type { Config } from '../config/config.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  useSummarizedThinking(): boolean;
}

export enum AuthType {
  USE_OPENAI = 'openai',
  QWEN_OAUTH = 'qwen-oauth',
  OLLAMA = 'ollama',
  USE_GEMINI = 'gemini',
  USE_VERTEX_AI = 'vertex-ai',
  USE_ANTHROPIC = 'anthropic',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
  enableOpenAILogging?: boolean;
  openAILoggingDir?: string;
  timeout?: number; // Timeout configuration in milliseconds
  maxRetries?: number; // Maximum retries for failed requests
  disableCacheControl?: boolean; // Disable cache control for DashScope providers
  samplingParams?: {
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    temperature?: number;
    max_tokens?: number;
  };
  reasoning?:
    | false
    | {
        effort?: 'low' | 'medium' | 'high';
        budget_tokens?: number;
      };
  proxy?: string | undefined;
  userAgent?: string;
  // Schema compliance mode for tool definitions
  schemaCompliance?: 'auto' | 'openapi_30';
};

export function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | undefined,
  generationConfig?: Partial<ContentGeneratorConfig>,
): ContentGeneratorConfig {
  let newContentGeneratorConfig: Partial<ContentGeneratorConfig> = {
    ...(generationConfig || {}),
    authType,
    proxy: config?.getProxy(),
  };

  if (authType === AuthType.QWEN_OAUTH) {
    // For Qwen OAuth, we'll handle the API key dynamically in createContentGenerator
    // Set a special marker to indicate this is Qwen OAuth
    return {
      ...newContentGeneratorConfig,
      model: DEFAULT_QWEN_MODEL,
      apiKey: 'QWEN_OAUTH_DYNAMIC_TOKEN',
    } as ContentGeneratorConfig;
  }

  if (authType === AuthType.USE_OPENAI) {
    newContentGeneratorConfig = {
      ...newContentGeneratorConfig,
      apiKey: newContentGeneratorConfig.apiKey || process.env['OPENAI_API_KEY'],
      baseUrl:
        newContentGeneratorConfig.baseUrl || process.env['OPENAI_BASE_URL'],
      model: newContentGeneratorConfig.model || process.env['OPENAI_MODEL'],
    };

    if (!newContentGeneratorConfig.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not found.');
    }

    return {
      ...newContentGeneratorConfig,
      model: newContentGeneratorConfig?.model || 'qwen3-coder-plus',
    } as ContentGeneratorConfig;
  }

  // Enforce defaults for Ollama if explicitly selected or as fallback
  if (authType === AuthType.OLLAMA) {
    return {
      ...newContentGeneratorConfig,
      model: newContentGeneratorConfig?.model || 'qwen2.5-coder:7b',
      baseUrl:
        newContentGeneratorConfig?.baseUrl || 'http://localhost:11434/v1',
      apiKey: 'ollama', // Placeholder key
    } as ContentGeneratorConfig;
  }

  return {
    ...newContentGeneratorConfig,
    model: newContentGeneratorConfig?.model || DEFAULT_QWEN_MODEL,
  } as ContentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  isInitialAuth?: boolean,
): Promise<ContentGenerator> {
  if (
    config.authType === AuthType.USE_OPENAI ||
    config.authType === AuthType.OLLAMA
  ) {
    if (config.authType === AuthType.USE_OPENAI && !config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Import OpenAIContentGenerator dynamically to avoid circular dependencies
    const { createOpenAIContentGenerator } = await import(
      './openaiContentGenerator/index.js'
    );

    // Always use OpenAIContentGenerator, logging is controlled by enableOpenAILogging flag
    // It handles Ollama internally via provider detection or explicit configuration
    return createOpenAIContentGenerator(config, gcConfig);
  }

  if (config.authType === AuthType.QWEN_OAUTH) {
    // Import required classes dynamically
    const { getQwenOAuthClient: getQwenOauthClient } = await import(
      '../qwen/qwenOAuth2.js'
    );
    const { QwenContentGenerator } = await import(
      '../qwen/qwenContentGenerator.js'
    );

    try {
      // Get the Qwen OAuth client (now includes integrated token management)
      // If this is initial auth, require cached credentials to detect missing credentials
      const qwenClient = await getQwenOauthClient(
        gcConfig,
        isInitialAuth ? { requireCachedCredentials: true } : undefined,
      );

      // Create the content generator with dynamic token management
      const generator = new QwenContentGenerator(qwenClient, config, gcConfig);
      return generator;
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (config.authType === AuthType.USE_ANTHROPIC) {
    if (!config.apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable not found.');
    }

    const { createAnthropicContentGenerator } = await import(
      './anthropicContentGenerator/index.js'
    );

    const generator = createAnthropicContentGenerator(config, gcConfig);
    return generator;
  }

  if (
    config.authType === AuthType.USE_GEMINI ||
    config.authType === AuthType.USE_VERTEX_AI
  ) {
    const { createGeminiContentGenerator } = await import(
      './geminiContentGenerator/index.js'
    );
    const generator = createGeminiContentGenerator(config, gcConfig);
    return generator;
  }

  throw new Error(
    `Error creating contentGenerator: Unsupported authType: ${config.authType}`,
  );
}
