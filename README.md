# Sosh

<div align="center">

![Qwen Code Screenshot](./docs/assets/qwen-screenshot.png)

[![License](https://img.shields.io/github/license/chrisburlacu1/qwen-code.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**AI-powered command-line workflow tool for developers - Optimized for Ollama & Offline Use**

[Installation](#installation) • [Quick Start](#quick-start) • [Ollama Setup](#ollama-setup) • [Features](#key-features) • [Documentation](./docs/) • [Contributing](./CONTRIBUTING.md)

</div>

> **🔄 This is a fork optimized for [Ollama](https://ollama.ai) and offline/air-gapped environments.**  
> For the original Qwen Code with cloud API support, see [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)

## 🎯 What's Different?

This fork is specifically configured for:

- ✅ **Local LLM inference** via Ollama (no internet required)
- ✅ **Offline/air-gapped environments** (no external API calls)
- ✅ **qwen3-coder** and other models running locally
- ✅ **Telemetry disabled by default** (privacy-focused)
- ✅ **Web search disabled by default** (offline-first)

All core features remain the same - code understanding, editing, automation, and more!

<div align="center">
  
  <a href="https://qwenlm.github.io/qwen-code-docs/de/">Deutsch</a> | 
  <a href="https://qwenlm.github.io/qwen-code-docs/fr">français</a> | 
  <a href="https://qwenlm.github.io/qwen-code-docs/ja/">日本語</a> | 
  <a href="https://qwenlm.github.io/qwen-code-docs/ru">Русский</a> | 
  <a href="https://qwenlm.github.io/qwen-code-docs/zh/">中文</a>
  
</div>

![](https://gw.alicdn.com/imgextra/i1/O1CN01D2DviS1wwtEtMwIzJ_!!6000000006373-2-tps-1600-900.png)

## Why Qwen Code?

- **OpenAI-compatible, OAuth free tier**: use an OpenAI-compatible API, or sign in with Qwen OAuth to get 2,000 free requests/day.
- **Open-source, co-evolving**: both the framework and the Qwen3-Coder model are open-source—and they ship and evolve together.
- **Agentic workflow, feature-rich**: rich built-in tools (Skills, SubAgents, Plan Mode) for a full agentic workflow and a Claude Code-like experience.
- **Terminal-first, IDE-friendly**: built for developers who live in the command line, with optional integration for VS Code and Zed.

## Installation

### Prerequisites

1. **Install Ollama**: [https://ollama.ai](https://ollama.ai)
2. **Pull qwen3-coder model**:
   ```bash
   ollama pull qwen3-coder
   ```
3. **Install Node.js 20+**: [https://nodejs.org](https://nodejs.org)

### Install from source

```bash
git clone https://github.com/chrisburlacu1/qwen-code.git
cd qwen-code
npm install
npm run build
npm install -g .
```

## Ollama Setup

### Quick Configuration

Set environment variables:

```bash
export OPENAI_API_KEY="ollama"  # Ollama doesn't require a real key
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_MODEL="qwen3-coder"  # Must match your Ollama model name
```

### Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test the model
ollama run qwen3-coder "Hello!"
```

### Configuration File (Alternative)

Create `~/.qwen/settings.json`:

```json
{
  "security": {
    "auth": {
      "selectedType": "openai",
      "apiKey": "ollama",
      "baseUrl": "http://localhost:11434/v1"
    }
  },
  "model": {
    "generationConfig": {
      "model": "qwen3-coder"
    }
  },
  "telemetry": {
    "enabled": false
  }
}
```

See [OLLAMA_README.md](./OLLAMA_README.md) for detailed setup instructions.

## VS Code Extension

In addition to the CLI tool, Qwen Code also provides a **VS Code extension** that brings AI-powered coding assistance directly into your editor with features like file system operations, native diffing, interactive chat, and more.

> 📦 The extension is currently in development. For installation, features, and development guide, see the [VS Code Extension README](./packages/vscode-ide-companion/README.md).

## Quick Start

```bash
# Start Qwen Code (interactive)
qwen

# Then, in the session:
/help
/auth
```

On first use, you'll be prompted to sign in. You can run `/auth` anytime to switch authentication methods.

Example prompts:

```text
What does this project do?
Explain the codebase structure.
Help me refactor this function.
Generate unit tests for this module.
```

<details>
<summary>Click to watch a demo video</summary>

<video src="https://cloud.video.taobao.com/vod/HLfyppnCHplRV9Qhz2xSqeazHeRzYtG-EYJnHAqtzkQ.mp4" controls>
Your browser does not support the video tag.
</video>

</details>

## Authentication

Qwen Code supports two authentication methods:

- **Qwen OAuth (recommended & free)**: sign in with your `qwen.ai` account in a browser.
- **OpenAI-compatible API**: use `OPENAI_API_KEY` (and optionally a custom base URL / model).

#### Qwen OAuth (recommended)

Start `qwen`, then run:

```bash
/auth
```

Choose **Qwen OAuth** and complete the browser flow. Your credentials are cached locally so you usually won't need to log in again.

#### OpenAI-compatible API (API key)

Environment variables (recommended for CI / headless environments):

```bash
export OPENAI_API_KEY="your-api-key-here"
export OPENAI_BASE_URL="https://api.openai.com/v1"  # optional
export OPENAI_MODEL="gpt-4o"                        # optional
```

For details (including `.qwen/.env` loading and security notes), see the [authentication guide](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/).

## Usage

As an open-source terminal agent, you can use Qwen Code in four primary ways:

1. Interactive mode (terminal UI)
2. Headless mode (scripts, CI)
3. IDE integration (VS Code, Zed)
4. TypeScript SDK

#### Interactive mode

```bash
cd your-project/
qwen
```

Run `qwen` in your project folder to launch the interactive terminal UI. Use `@` to reference local files (for example `@src/main.ts`).

#### Headless mode

```bash
cd your-project/
qwen -p "your question"
```

Use `-p` to run Qwen Code without the interactive UI—ideal for scripts, automation, and CI/CD. Learn more: [Headless mode](https://qwenlm.github.io/qwen-code-docs/en/users/features/headless).

#### IDE integration

Use Qwen Code inside your editor (VS Code and Zed):

- [Use in VS Code](https://qwenlm.github.io/qwen-code-docs/en/users/integration-vscode/)
- [Use in Zed](https://qwenlm.github.io/qwen-code-docs/en/users/integration-zed/)

#### TypeScript SDK

Build on top of Qwen Code with the TypeScript SDK:

- [Use the Qwen Code SDK](./packages/sdk-typescript/README.md)

## Commands & Shortcuts

### Session Commands

- `/help` - Display available commands
- `/clear` - Clear conversation history
- `/compress` - Compress history to save tokens
- `/stats` - Show current session information
- `/bug` - Submit a bug report
- `/exit` or `/quit` - Exit Qwen Code

### Keyboard Shortcuts

- `Ctrl+C` - Cancel current operation
- `Ctrl+D` - Exit (on empty line)
- `Up/Down` - Navigate command history

> Learn more about [Commands](https://qwenlm.github.io/qwen-code-docs/en/users/features/commands/)
>
> **Tip**: In YOLO mode (`--yolo`), vision switching happens automatically without prompts when images are detected. Learn more about [Approval Mode](https://qwenlm.github.io/qwen-code-docs/en/users/features/approval-mode/)

## Configuration

Qwen Code can be configured via `settings.json`, environment variables, and CLI flags.

- **User settings**: `~/.qwen/settings.json`
- **Project settings**: `.qwen/settings.json`

See [settings](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/) for available options and precedence.

## Benchmark Results

### Terminal-Bench Performance

| Agent     | Model              | Accuracy |
| --------- | ------------------ | -------- |
| Qwen Code | Qwen3-Coder-480A35 | 37.5%    |
| Qwen Code | Qwen3-Coder-30BA3B | 31.3%    |

## Ecosystem

Looking for a graphical interface?

- [**AionUi**](https://github.com/iOfficeAI/AionUi) A modern GUI for command-line AI tools including Qwen Code
- [**Gemini CLI Desktop**](https://github.com/Piebald-AI/gemini-cli-desktop) A cross-platform desktop/web/mobile UI for Qwen Code

## Troubleshooting

If you encounter issues, check the [troubleshooting guide](https://qwenlm.github.io/qwen-code-docs/en/users/support/troubleshooting/).

To report a bug from within the CLI, run `/bug` and include a short title and repro steps.

## Acknowledgments

This project is based on [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). We acknowledge and appreciate the excellent work of the Gemini CLI team. Our main contribution focuses on parser-level adaptations to better support Qwen-Coder models.
