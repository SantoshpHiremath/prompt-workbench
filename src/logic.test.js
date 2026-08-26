import { describe, it, expect } from "vitest";
import { scorePrompt, createLogEntry, summarizeLog, searchLog } from "./logic";

describe("scorePrompt", () => {
  it("returns all zeros for empty input", () => {
    expect(scorePrompt("")).toEqual({ clarity: 0, specificity: 0, length: 0, total: 0 });
  });

  it("returns all zeros for whitespace-only input", () => {
    expect(scorePrompt("   ")).toEqual({ clarity: 0, specificity: 0, length: 0, total: 0 });
  });

  it("scores a vague short prompt low", () => {
    const result = scorePrompt("do something");
    expect(result.total).toBeLessThan(5);
  });

  it("scores a clear, specific, well-sized prompt higher", () => {
    const prompt =
      "Write a summary of the following text. Format the output as a bulleted list " +
      "with exactly 3 bullet points. For example: - Point one. Must be concise.";
    const result = scorePrompt(prompt);
    expect(result.clarity).toBeGreaterThan(0);
    expect(result.specificity).toBeGreaterThan(0);
    expect(result.length).toBe(5);
    expect(result.total).toBeGreaterThanOrEqual(8);
  });

  it("penalizes extremely long prompts on the length dimension", () => {
    const longPrompt = "explain " + "word ".repeat(260);
    const result = scorePrompt(longPrompt);
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("caps clarity and specificity at 5 even with many keyword hits", () => {
    const stuffed =
      "write generate summarize explain list return format output " +
      "example e.g. must should exactly json bullet step";
    const result = scorePrompt(stuffed);
    expect(result.clarity).toBeLessThanOrEqual(5);
    expect(result.specificity).toBeLessThanOrEqual(5);
  });
});

describe("createLogEntry", () => {
  it("creates an entry with the correct shape and a computed score", () => {
    const entry = createLogEntry({ id: 1, promptText: "Write a haiku.", notes: "test", timestampMs: 0 });
    expect(entry.id).toBe(1);
    expect(entry.promptText).toBe("Write a haiku.");
    expect(entry.notes).toBe("test");
    expect(entry.score).toBeDefined();
    expect(entry.score.total).toBe(scorePrompt("Write a haiku.").total);
  });

  it("defaults notes to an empty string when omitted", () => {
    const entry = createLogEntry({ id: 2, promptText: "Explain recursion.", timestampMs: 0 });
    expect(entry.notes).toBe("");
  });
});

describe("summarizeLog", () => {
  it("returns a zeroed summary for an empty list", () => {
    expect(summarizeLog([])).toEqual({ count: 0, averageTotal: 0, bestEntry: null, worstEntry: null });
  });

  it("computes count, average, and best/worst entries correctly", () => {
    const entries = [
      createLogEntry({ id: 1, promptText: "do it", timestampMs: 0 }), // low score
      createLogEntry({
        id: 2,
        promptText: "Write a summary. Format as JSON. For example: {\"key\": \"value\"}. Must be exact.",
        timestampMs: 1,
      }), // high score
    ];
    const summary = summarizeLog(entries);
    expect(summary.count).toBe(2);
    expect(summary.bestEntry.id).toBe(2);
    expect(summary.worstEntry.id).toBe(1);
    expect(summary.averageTotal).toBeGreaterThan(0);
  });
});

describe("searchLog", () => {
  const entries = [
    createLogEntry({ id: 1, promptText: "Summarize this article", notes: "used for reports", timestampMs: 0 }),
    createLogEntry({ id: 2, promptText: "Translate to German", notes: "", timestampMs: 1 }),
  ];

  it("returns all entries when query is empty", () => {
    expect(searchLog(entries, "")).toHaveLength(2);
  });

  it("filters by prompt text (case-insensitive)", () => {
    const result = searchLog(entries, "SUMMARIZE");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("filters by notes text", () => {
    const result = searchLog(entries, "reports");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns empty array when nothing matches", () => {
    expect(searchLog(entries, "nonexistent")).toHaveLength(0);
  });
});
