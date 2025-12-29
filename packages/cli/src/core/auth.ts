/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type Config,
  type AuthType,
  getErrorMessage,
} from '@qwen-code/qwen-code-core';

/**
 * Handles the initial authentication flow.
 * @param config The application config.
 * @param authType The selected auth type.
 * @returns An error message if authentication fails, otherwise null.
 */
export async function performInitialAuth(
  config: Config,
  authType: AuthType | undefined,
): Promise<string | null> {
  if (!authType) {
    return null;
  }

  try {
    await config.refreshAuth(authType, true);
  } catch (e) {
    // In offline mode, we might expect some failures if using cloud providers,
    // but for local providers (Ollama), this should work.
    // If it fails, capturing the error is better than silence if it means no generator.
    const errorMessage = `Failed to login. Message: ${getErrorMessage(e)}`;
    console.warn(errorMessage);
    return errorMessage;
  }

  return null;
}
