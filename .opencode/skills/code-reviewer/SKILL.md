---
name: code-reviewer
description: Senior-engineer-level code review that checks for bugs, style issues, security vulnerabilities, and architectural problems. Use when the user asks to "review this code", "review the changes", or wants a senior engineer perspective.
license: MIT
compatibility: opencode
metadata:
  audience: engineers
  workflow: review
---

## What I do

Performs a rigorous, senior-engineer code review of a file, a set of changes, or an entire codebase, surfacing concrete, prioritized issues.

## When to use me

Use when the user says: "review this code", "review the changes", "review my PR", or asks for a senior engineer opinion on code quality.

## Workflow

### 1. Scope the review
Determine what to review. If the user didn't specify, review the most recent changes or the file(s) they reference.

### 2. Analyze
Read the code thoroughly and evaluate against:
- **Correctness**: logic bugs, race conditions, off-by-one errors, unhandled edge cases
- **Security**: injection, secrets exposed, unsafe deserialization, path traversal, missing authz
- **Style**: naming, formatting, error handling, consistency with codebase
- **Architecture**: cohesion, coupling, abstraction levels, violating separation of concerns
- **Performance**: obvious O(n²), redundant work, blocking calls

### 3. Report
Present findings as a prioritized list. For each issue include:
- Severity (Critical / Major / Minor / Nit)
- Location (`file:line`)
- The problem
- A suggested fix

Order by severity. Be concrete, not vague. Do not invent issues — only report real problems.

### 4. NOT a rewrite
Do NOT rewrite the code unless explicitly asked. This is a review, not an implementation. Provide the report and stop.

## Rules
- Cite real line numbers from the actual file content.
- Do not report style nits as critical.
- If the code is fine, say so briefly — not everything needs a finding.
