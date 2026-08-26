# Prompt Engineering Workbench

A React app for drafting, logging, and scoring prompts against a small,
transparent rubric — built to get real, tested experience with a modern
frontend framework (React) combined with prompt-engineering practice,
closing a specific gap: prior projects used vanilla HTML/CSS/JS, not a
framework, and several current internship postings ask for framework
experience (React, Vue) specifically alongside AI-tools/prompt-engineering
skills.

## What it does

- **Log a prompt** — paste or write a prompt and optional notes (e.g. which
  model, what changed from the last version).
- **Automatic scoring** — every logged prompt is scored 0-5 on three
  dimensions (clarity, specificity, length) by a deterministic heuristic
  rubric, for a fast first-pass signal while iterating.
- **Dashboard** — live count, average score, and the best-scoring prompt so
  far, recalculated on every new entry.
- **Search** — filter the log by prompt text or notes.

## Why the scorer is rule-based, not an LLM judge

Same honesty approach as the
[ai-report-automation](../ai-report-automation/) project: this build
environment has no LLM API access (no API key, no local model runtime), so
rather than fake an "AI-scored" feature, the rubric scorer is a real,
deterministic, fully-tested heuristic — keyword presence for clarity/
specificity, word-count banding for length. It's disclosed as exactly that.
Swapping in an LLM-based judge later (e.g. "does this prompt clearly state
the task and format?" scored by a real model call) would replace
`scorePrompt()` in `src/logic.js` without needing to change anything else
in the app.

## Tech

- React 19 + Vite
- Plain CSS (no UI framework) — kept intentionally simple
- Vitest + React Testing Library for tests

## Verification

18 tests, all passing (`npx vitest run`):
- 15 unit tests on the pure logic layer (`src/logic.test.js`) — scoring
  edge cases (empty input, very long input, keyword caps), log-entry
  creation, dashboard summary computation, and search filtering.
- 4 integration tests (`src/App.test.jsx`) rendering the real app with
  React Testing Library — logging a prompt end-to-end and confirming it
  appears with the correct score, confirming empty submissions are
  rejected, and confirming the search box actually filters the rendered
  list. Two of these initially failed on ambiguous text queries (the same
  text can legitimately appear in both the log list and the dashboard's
  "best scoring" preview) — fixed by scoping the assertions to the correct
  DOM region rather than weakening what they check.

Also verified visually: built for production (`npm run build`), served
with `vite preview`, and driven with a real headless-browser script
(Playwright) that types into the form, submits two prompts of different
quality, and screenshots the rendered result — confirming the dashboard and
scores update correctly in an actual browser, not just in test assertions.

## Running it

```bash
npm install
npm run dev        # local dev server
npm run build       # production build
npx vitest run       # run the test suite
```
