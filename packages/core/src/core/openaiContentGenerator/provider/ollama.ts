/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import OpenAI from 'openai';
import type { Config } from '../../../config/config.js';
import type { ContentGeneratorConfig } from '../../contentGenerator.js';
import {
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  DEFAULT_OLLAMA_BASE_URL,
} from '../constants.js';
import type { OpenAICompatibleProvider } from './types.js';
import type { GenerateContentConfig } from '@google/genai';

/**
 * Provider for Ollama (local LLM inference)
 *
 * Ollama provides an OpenAI-compatible API, so this provider
 * uses the standard OpenAI client with Ollama-specific defaults.
 */
export class OllamaOpenAICompatibleProvider
  implements OpenAICompatibleProvider
{
  protected contentGeneratorConfig: ContentGeneratorConfig;
  protected cliConfig: Config;

  constructor(
    contentGeneratorConfig: ContentGeneratorConfig,
    cliConfig: Config,
  ) {
    this.cliConfig = cliConfig;
    this.contentGeneratorConfig = contentGeneratorConfig;
  }

  /**
   * Check if the configuration is for Ollama
   */
  static isOllamaProvider(
    contentGeneratorConfig: ContentGeneratorConfig,
  ): boolean {
    const baseUrl = contentGeneratorConfig.baseUrl;
    if (!baseUrl) {
      return false;
    }

    // Check for common Ollama URL patterns
    return (
      baseUrl.includes('localhost:11434') ||
      baseUrl.includes('127.0.0.1:11434') ||
      baseUrl.includes('ollama') ||
      baseUrl.startsWith('http://localhost:') ||
      baseUrl.startsWith('http://127.0.0.1:')
    );
  }

  buildHeaders(): Record<string, string | undefined> {
    const version = this.cliConfig.getCliVersion() || 'unknown';
    const userAgent = `QwenCode-Ollama/${version} (${process.platform}; ${process.arch})`;
    return {
      'User-Agent': userAgent,
    };
  }

  buildClient(): OpenAI {
    const {
      apiKey,
      baseUrl = DEFAULT_OLLAMA_BASE_URL,
      timeout = DEFAULT_TIMEOUT,
      maxRetries = DEFAULT_MAX_RETRIES,
    } = this.contentGeneratorConfig;
    const defaultHeaders = this.buildHeaders();

    // Ollama doesn't require a real API key, but the OpenAI client expects one
    // Use a placeholder if not provided
    const effectiveApiKey = apiKey || 'ollama';

    return new OpenAI({
      apiKey: effectiveApiKey,
      baseURL: baseUrl,
      timeout,
      maxRetries,
      defaultHeaders,
    });
  }

  buildRequest(
    request: OpenAI.Chat.ChatCompletionCreateParams,
    _userPromptId: string,
  ): OpenAI.Chat.ChatCompletionCreateParams {
    // Ollama is fully OpenAI-compatible, no special modifications needed
    return {
      ...request,
    };
  }
  getDefaultGenerationConfig(): GenerateContentConfig {
    return {
      topP: 0.95,
    };
  }
}
