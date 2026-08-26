import { useState, useMemo } from "react";
import { createLogEntry, summarizeLog, searchLog } from "./logic";
import "./App.css";

let nextId = 1;

function ScoreBadge({ label, value, max = 5 }) {
  return (
    <span className="score-badge">
      {label}: <strong>{value}</strong>/{max}
    </span>
  );
}

function PromptForm({ onAdd }) {
  const [promptText, setPromptText] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!promptText.trim()) return;
    onAdd(promptText, notes);
    setPromptText("");
    setNotes("");
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <label>
        Prompt
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Write the prompt you want to log and score..."
          rows={5}
        />
      </label>
      <label>
        Notes (optional)
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. which model, what it was for, what changed from last version"
        />
      </label>
      <button type="submit">Log & Score Prompt</button>
    </form>
  );
}

function Dashboard({ summary }) {
  if (summary.count === 0) {
    return <p className="empty-state">No prompts logged yet.</p>;
  }
  return (
    <div className="dashboard">
      <div className="stat">
        <span className="stat-label">Logged prompts</span>
        <span className="stat-value">{summary.count}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Average score</span>
        <span className="stat-value">{summary.averageTotal} / 15</span>
      </div>
      <div className="stat">
        <span className="stat-label">Best scoring</span>
        <span className="stat-value stat-preview">
          {summary.bestEntry.promptText.slice(0, 40)}
          {summary.bestEntry.promptText.length > 40 ? "…" : ""} ({summary.bestEntry.score.total}/15)
        </span>
      </div>
    </div>
  );
}

function LogList({ entries }) {
  if (entries.length === 0) {
    return <p className="empty-state">No matching prompts.</p>;
  }
  return (
    <ul className="log-list">
      {entries.map((entry) => (
        <li key={entry.id} className="log-entry">
          <p className="log-prompt">{entry.promptText}</p>
          {entry.notes && <p className="log-notes">{entry.notes}</p>}
          <div className="log-scores">
            <ScoreBadge label="Clarity" value={entry.score.clarity} />
            <ScoreBadge label="Specificity" value={entry.score.specificity} />
            <ScoreBadge label="Length" value={entry.score.length} />
            <span className="score-badge score-total">Total: {entry.score.total}/15</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");

  function handleAdd(promptText, notes) {
    const entry = createLogEntry({
      id: nextId++,
      promptText,
      notes,
      timestampMs: entries.length, // deterministic ordering counter, not a real clock
    });
    setEntries((prev) => [entry, ...prev]);
  }

  const summary = useMemo(() => summarizeLog(entries), [entries]);
  const filtered = useMemo(() => searchLog(entries, query), [entries, query]);

  return (
    <div className="workbench">
      <header>
        <h1>Prompt Engineering Workbench</h1>
        <p className="subtitle">
          Draft, log, and score prompts against a transparent rubric — track what's working
          as you iterate.
        </p>
      </header>

      <section className="panel">
        <h2>New Prompt</h2>
        <PromptForm onAdd={handleAdd} />
      </section>

      <section className="panel">
        <h2>Dashboard</h2>
        <Dashboard summary={summary} />
      </section>

      <section className="panel">
        <h2>Log</h2>
        <input
          type="text"
          className="search-box"
          placeholder="Search logged prompts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <LogList entries={filtered} />
      </section>
    </div>
  );
}

export default App;
