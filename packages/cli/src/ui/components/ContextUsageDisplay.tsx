/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { tokenLimit } from '@qwen-code/qwen-code-core';

export const ContextUsageDisplay = ({
  promptTokenCount,
  model,
  terminalWidth,
}: {
  promptTokenCount: number;
  model: string;
  terminalWidth: number;
}) => {
  const limit = tokenLimit(model);
  const percentage = promptTokenCount / limit;
  const percentageLeft = ((1 - percentage) * 100).toFixed(0);

  const formatLimit = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(0) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return n.toString();
  };

  const limitStr = formatLimit(limit);
  const label =
    terminalWidth < 100
      ? `% (${limitStr})`
      : `% context left (max ${limitStr})`;

  return (
    <Text color={theme.text.secondary}>
      ({percentageLeft}
      {label})
    </Text>
  );
};
