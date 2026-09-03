---
name: self-review-loop
description: Structured self-review loop for verifying code correctness before declaring a task done. Use after implementing code to catch bugs, verify against requirements, and run verification commands.
license: MIT
compatibility: opencode
metadata:
  audience: engineers
  workflow: review
---

## What I do

Runs a multi-pass self-review on recently written code to catch errors, verify requirements were met, and confirm the code actually runs.

## When to use me

Use this after implementing a feature, fixing a bug, or refactoring — before telling the user the task is complete.

## Workflow

### Pass 1: Requirement check
Re-read the original request and confirm every stated requirement is actually implemented. If something is missing, it's not done.

### Pass 2: Correctness review
Review the diff line-by-line for:
- Logic errors, off-by-one errors, null/undefined dereferences
- Incorrect API usage or wrong parameter ordering
- Missing error handling for edge cases

### Pass 3: Style & conventions
Confirm the new code matches the surrounding codebase conventions (naming, imports, error handling patterns). Flag inconsistencies.

### Pass 4: Verification
Run the available verification commands (lint, typecheck, tests) and confirm they pass. If none exist, state so explicitly and do a manual trace of the critical path.

### Output
Report results concisely:
- What passed
- Issues found (with file:line references)
- Whether the task can be considered complete

## Rules
- Never report "done" without completing all passes.
- If verification commands fail, fix and re-run — do not skip.
- Keep the report short and actionable.
