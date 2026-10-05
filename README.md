# Prompt Engineering Workbench

A React app for drafting, logging, and scoring prompts against a small,
transparent rubric. I built it to combine hands-on work with a modern
frontend framework (React) and prompt-engineering practice.

## What it does

- **Log a prompt** — paste or write a prompt and optional notes (e.g. which
  model, what changed from the last version).
- **Automatic scoring** — every logged prompt is scored 0-5 on three
  dimensions (clarity, specificity, length) by a deterministic heuristic
  rubric, for a fast first-pass signal while iterating.
- **Dashboard** — live count, average score, and the best-scoring prompt so
  far, recalculated on every new entry.
- **Search** — filter the log by prompt text or notes.

## Scope

The scorer is a rule-based rubric rather than an LLM judge: keyword presence
for clarity and specificity, word-count banding for length. It is
deterministic and fully tested, and it needs no API key or model runtime.
An LLM-based judge (for example, "does this prompt clearly state the task and
format?") can replace `scorePrompt()` in `src/logic.js` without changing
anything else in the app.

## Tech

- React 19 + Vite
- Plain CSS (no UI framework), kept intentionally simple
- Vitest + React Testing Library for tests

## Tests

18 tests, all passing (`npx vitest run`):
- 14 unit tests on the pure logic layer (`src/logic.test.js`): scoring
  edge cases (empty input, very long input, keyword caps), log-entry
  creation, dashboard summary computation, and search filtering.
- 4 integration tests (`src/App.test.jsx`) rendering the real app with
  React Testing Library: logging a prompt end-to-end and confirming it
  appears with the correct score, rejecting empty submissions, and
  confirming the search box filters the rendered list. Assertions are scoped
  to the correct DOM region, because the same text can legitimately appear
  in both the log list and the dashboard's "best scoring" preview.

I also checked it in a real browser: a production build (`npm run build`)
served with `vite preview` and driven by a headless-browser script
(Playwright) that types into the form, submits two prompts of different
quality, and screenshots the result. The dashboard and scores update
correctly (see `app_screenshot.png`).

## Running it

```bash
npm install
npm run dev        # local dev server
npm run build       # production build
npx vitest run       # run the test suite
```
