---
name: planning-with-files
description: Persistent planning workflow that writes implementation plans to plan files for long-running multi-step tasks. Use when the user says "plan and implement", "plan this", or for any complex multi-step engineering task that benefits from a written, tracked plan.
license: MIT
compatibility: opencode
metadata:
  audience: engineers
  workflow: planning
---

## What I do

Creates and maintains a persistent implementation plan as a markdown file so complex tasks survive session compaction and can be tracked across many steps.

## When to use me

Use this when:
- The user requests a multi-step feature or refactor ("plan and implement X")
- The task is complex enough that losing track of steps would be a problem
- You want the user to see and approve the plan before code is written

Ask clarifying questions if the scope is ambiguous (target API, frameworks, expected outputs).

## Workflow

### 1. Create the plan file

Write to `.plan.md` in the project root (or `docs/plan.md` if a docs folder exists). Include:

```markdown
# Implementation Plan: <short title>
Created: <date>
Status: <draft | approved | in-progress | complete>

## Goal
<one sentence>

## Steps
- [ ] Step 1: <concise action>
- [ ] Step 2: <concise action>
- [ ] ...

## Open Questions
- <any clarifications needed>
```

### 2. Show the plan and get approval

Present the plan concisely in chat and wait for explicit approval before writing code. The Lazy Senior Dev Rule applies: question each step's necessity; drop anything that doesn't add value.

### 3. Update as you go

After each completed step, update the checkboxes (`- [x]`) and add short notes on what changed and why. Keep status current.

### 4. Verify

When all steps are checked, mark status `complete` and run whatever verification exists (lint, tests, typecheck). Never mark complete without verification.

## Rules
- Keep the plan file minimal and current.
- Do not pad with speculative steps.
- Write the file before writing implementation code.
