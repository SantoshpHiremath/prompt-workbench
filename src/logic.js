// Core logic for the Prompt Engineering Workbench — kept separate from
// React components so it's easily unit-testable without rendering.

/**
 * Scores a prompt run against a small, transparent rubric (0-5 each):
 *  - clarity: does the prompt state the task, format, and constraints?
 *  - specificity: does it give concrete examples or exact output shape?
 *  - length: is it reasonably concise (not a hard-coded ideal, just a
 *    soft penalty for extremely short or extremely long prompts)?
 * This is a deterministic heuristic scorer, not an LLM judge — it's meant
 * to give a fast, explainable first-pass signal while iterating on a
 * prompt, not to replace human or model-based evaluation.
 */
export function scorePrompt(promptText) {
  if (typeof promptText !== "string" || promptText.trim().length === 0) {
    return { clarity: 0, specificity: 0, length: 0, total: 0 };
  }

  const text = promptText.trim();
  const lower = text.toLowerCase();

  // Clarity: presence of task-defining or format-defining language.
  const clarityKeywords = ["write", "generate", "summarize", "explain", "list", "return", "format", "output"];
  const clarityHits = clarityKeywords.filter((kw) => lower.includes(kw)).length;
  const clarity = Math.min(5, clarityHits);

  // Specificity: presence of concrete constraints/examples.
  const specificityKeywords = ["example", "e.g.", "must", "should", "exactly", "json", "bullet", "step"];
  const specificityHits = specificityKeywords.filter((kw) => lower.includes(kw)).length;
  const specificity = Math.min(5, specificityHits);

  // Length: soft scoring — too short (<10 words) or very long (>200 words)
  // loses points; a reasonable middle range scores full.
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let length;
  if (wordCount < 5) length = 0;
  else if (wordCount < 10) length = 2;
  else if (wordCount <= 150) length = 5;
  else if (wordCount <= 250) length = 3;
  else length = 1;

  const total = clarity + specificity + length;

  return { clarity, specificity, length, total };
}

/**
 * Creates a new prompt-run log entry. Pure function, no side effects,
 * no Date.now()/Math.random() dependency on the caller — timestamp is
 * passed in explicitly so this stays deterministic and testable.
 */
export function createLogEntry({ id, promptText, notes = "", timestampMs }) {
  const score = scorePrompt(promptText);
  return {
    id,
    promptText,
    notes,
    timestampMs,
    score,
  };
}

/**
 * Computes dashboard summary stats from a list of log entries.
 */
export function summarizeLog(entries) {
  if (!entries || entries.length === 0) {
    return { count: 0, averageTotal: 0, bestEntry: null, worstEntry: null };
  }

  const totals = entries.map((e) => e.score.total);
  const averageTotal = totals.reduce((a, b) => a + b, 0) / entries.length;

  const bestEntry = entries.reduce((best, e) => (e.score.total > best.score.total ? e : best), entries[0]);
  const worstEntry = entries.reduce((worst, e) => (e.score.total < worst.score.total ? e : worst), entries[0]);

  return {
    count: entries.length,
    averageTotal: Math.round(averageTotal * 100) / 100,
    bestEntry,
    worstEntry,
  };
}

/**
 * Filters log entries by a simple text search over the prompt and notes.
 */
export function searchLog(entries, query) {
  if (!query || query.trim() === "") return entries;
  const q = query.trim().toLowerCase();
  return entries.filter(
    (e) => e.promptText.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q)
  );
}
