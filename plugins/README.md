# Faraday plugins

Install-and-use packages that teach your coding agent to drive Faraday — scaffold
interactive lessons, author against the locked-tree + blocks contract, pass the
quality gates, embed a grounded AI tutor, and deploy. Built for GTM **Stage 1**:
creators who already run an agent and want the whole loop as one install.

| Agent | Folder | Install |
|---|---|---|
| **Claude Code** | [`claude-code/`](claude-code/) | `/plugin marketplace add titanism/faraday-edu` → `/plugin install faraday@faraday` |
| **Codex** | [`codex/`](codex/) | `codex plugin marketplace add titanism/faraday-edu` (or copy `.agents/skills/` + `AGENTS.md`) |

Both ship the same **`faraday` skill** (the authoring brain + `blocks` / `tutor` /
`worlds` references). The Claude Code plugin adds `/faraday-*` slash commands and a
`faraday-author` subagent; the Codex plugin adds an `AGENTS.md` contract for the
zero-dependency path. See each folder's README for details and prerequisites.

Marketplace catalogs live at the repo root: `.claude-plugin/marketplace.json`
(Claude Code) and `.agents/plugins/marketplace.json` (Codex).
