import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App (integration)", () => {
  it("renders the empty state initially", () => {
    render(<App />);
    expect(screen.getByText(/no prompts logged yet/i)).toBeInTheDocument();
  });

  it("logs a new prompt and shows it in the list with a score", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/write the prompt you want to log/i);
    await user.type(textarea, "Write a summary. Format as a list. Example: - item one.");
    await user.click(screen.getByRole("button", { name: /log & score prompt/i }));

    // The prompt text legitimately appears twice (log entry + dashboard
    // "best scoring" preview) — assert on the log entry specifically via
    // its known class rather than a single ambiguous text match.
    const logEntries = document.querySelectorAll(".log-prompt");
    expect(logEntries).toHaveLength(1);
    expect(logEntries[0].textContent).toMatch(/write a summary\. format as a list/i);
    expect(screen.getByText(/logged prompts/i)).toBeInTheDocument();
    const countStat = document.querySelector(".stat .stat-value");
    expect(countStat.textContent).toBe("1"); // count stat, scoped to the first dashboard stat
  });

  it("does not add an entry when the prompt field is empty", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /log & score prompt/i }));
    expect(screen.getByText(/no prompts logged yet/i)).toBeInTheDocument();
  });

  it("filters the log via the search box", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByPlaceholderText(/write the prompt you want to log/i);
    await user.type(textarea, "Translate this into German");
    await user.click(screen.getByRole("button", { name: /log & score prompt/i }));

    await user.type(textarea, "Summarize this article in 3 bullets");
    await user.click(screen.getByRole("button", { name: /log & score prompt/i }));

    const search = screen.getByPlaceholderText(/search logged prompts/i);
    await user.type(search, "Translate");

    // Scope to the log list specifically — the dashboard's "best scoring"
    // preview is unaffected by the search box and may still show either
    // prompt, so only the .log-list contents should reflect the filter.
    const logList = document.querySelector(".log-list");
    expect(logList.textContent).toMatch(/translate this into german/i);
    expect(logList.textContent).not.toMatch(/summarize this article/i);
  });
});
