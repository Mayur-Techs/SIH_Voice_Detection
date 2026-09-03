# AGENTS.md — SIH Voice Detection

Project-wide agent behavior guide. This project uses a Mythos-class agent setup.
Note: this was an empty folder; the setup below establishes the engineering operating system.

## Core Operating Principles

1. **Be highly analytical** — favor reasoning over typing blind code. Show the thought process, logic breakdown, and architectural plan before writing large code blocks.
2. **Lazy Senior Dev Rule (Ponytail)** — question the necessity of code before writing it. Keep implementations minimal and clean. Remove anything that doesn't add value.
3. **Reliability Guard (ECC)** — verify file existence, paths, and package versions before running commands to eliminate runtime execution errors.

## Plugins

| Plugin | Purpose |
|--------|---------|
| `opencode-ponytail` | Lazy efficiency — keeps temperature low, flags redundant tool calls |
| `ecc-universal` | Verification loops — catches runtime errors and verifies paths |
| `opencode-orchestrator` | Multi-agent — tracks sessions, exposes `orchestrator_status` tool |
| `opencode-adaptive-thinking` | Reasoning depth — scales analysis depth and temperature to task complexity |
| `opencode-self-improve` | Pattern extraction — stores lessons learned in `.opencode/patterns.json`, exposes `self_improve_extract_pattern` / `self_improve_list_patterns` tools |

## Skills

| Skill | Purpose |
|-------|---------|
| `planning-with-files` | Persistent planning — writes tracked implementation plans to `.plan.md` |
| `self-review-loop` | Structured self-review — 4-pass verification before declaring a task done |
| `code-reviewer` | Senior-engineer review — prioritized findings with severity and file:line refs |

## Agents

- `code-reviewer` — subagent that reviews code for bugs, style, security, and architecture
- `architect` — subagent that designs systems before code; questions necessity
- `debugger` — subagent that finds root causes with systematic analysis

## MCP Servers

Connected via `opencode.jsonc`:
- `filesystem` — file access
- `memory` — knowledge graph persistence
- `sequential-thinking` — structured reasoning
- `context7` — up-to-date library/framework documentation
- `github` — GitHub API access

## Workflow

- **"Plan and implement [feature]"** → use `planning-with-files`, get approval, then implement
- **"Review this code"** → use `code-reviewer`
- Before finishing any task → run `self-review-loop`
- Capture reusable conventions → `self_improve_extract_pattern`

## Verification

Always run available lint/typecheck/test commands before reporting a task complete (ECC + self-review-loop). If none exist, state so explicitly and manually trace the critical path.
