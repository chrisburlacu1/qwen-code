/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from 'ink-testing-library';
import { describe, it, expect, vi } from 'vitest';
import { SessionSummaryDisplay } from './SessionSummaryDisplay.js';
import * as SessionContext from '../contexts/SessionContext.js';
import { ConfigContext } from '../contexts/ConfigContext.js';

vi.mock('../contexts/SessionContext.js', async (importOriginal) => {
  const actual = await importOriginal<typeof SessionContext>();
  return {
    ...actual,
    useSessionStats: vi.fn(),
  };
});

const useSessionStatsMock = vi.mocked(SessionContext.useSessionStats);

const renderWithMockedStats = (
  sessionId: string = 'test-session-id-12345',
  promptCount: number = 5,
  chatRecordingEnabled: boolean = true,
) => {
  useSessionStatsMock.mockReturnValue({
    stats: {
      sessionId,
      sessionStartTime: new Date(),
      promptCount,
    },

    getPromptCount: () => promptCount,
    startNewPrompt: vi.fn(),
  });

  const mockConfig = {
    getChatRecordingService: vi.fn(() =>
      chatRecordingEnabled ? ({} as never) : undefined,
    ),
  };

  return render(
    <ConfigContext.Provider value={mockConfig as never}>
      <SessionSummaryDisplay duration="1h 23m 45s" />
    </ConfigContext.Provider>,
  );
};

describe('<SessionSummaryDisplay />', () => {
  it('renders the summary display with a title', () => {
    const { lastFrame } = renderWithMockedStats();
    const output = lastFrame();

    expect(output).toContain('Agent powering down. Goodbye!');
    expect(output).toContain('To continue this session, run');
    expect(output).toContain('qwen --resume test-session-id-12345');
    expect(output).toMatchSnapshot();
  });

  it('does not show resume message when there are no messages', () => {
    // Pass promptCount = 0 to simulate no messages
    const { lastFrame } = renderWithMockedStats('test-session-id-12345', 0);
    const output = lastFrame();

    expect(output).toContain('Agent powering down. Goodbye!');
    expect(output).not.toContain('To continue this session, run');
    expect(output).not.toContain('qwen --resume');
  });

  it('does not show resume message when chat recording is disabled', () => {
    const { lastFrame } = renderWithMockedStats(
      'test-session-id-12345',
      5,
      false,
    );
    const output = lastFrame();

    expect(output).toContain('Agent powering down. Goodbye!');
    expect(output).not.toContain('To continue this session, run');
    expect(output).not.toContain('qwen --resume');
  });
});
