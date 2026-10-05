import { useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from './clipboard';
import { categories, cheatSheets, featuredMetrics, type Category } from './data';
import { filterCheatSheets } from './filter';

type CopyState = { title: string; ok: boolean } | null;

const REPO_DATA_URL = 'https://github.com/ArrinPaul/ArrinPaul/blob/main/open-dev-atlas/src/data.ts';

export default function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [copyState, setCopyState] = useState<CopyState>(null);
  const resetTimer = useRef<number | undefined>(undefined);

  const filteredItems = useMemo(
    () => filterCheatSheets(cheatSheets, query, activeCategory),
    [activeCategory, query],
  );

  // Clear a pending "Copied" reset if the component unmounts.
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copySnippet = async (title: string, snippet: string) => {
    const ok = await copyText(snippet);
    setCopyState({ title, ok });
    // Restart the timer so a second click does not get its label cleared early.
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState(null), 1600);
  };

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('All');
  };

  const resultsLabel =
    filteredItems.length === 1 ? '1 cheat sheet' : `${filteredItems.length} cheat sheets`;

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Open-source developer toolkit</p>
          <h1>Open Dev Atlas</h1>
          <p className="lede">
            An interactive cheat-sheet hub for modern developers. Search fast, copy a snippet in
            one click, and add your own.
          </p>

          <div className="metric-row">
            {featuredMetrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-panel">
          <div>
            <p className="panel-title">How it works</p>
            <ul>
              <li>Search by title, tag, category or snippet text.</li>
              <li>Filter by category with the chips below.</li>
              <li>Copy any snippet with one click.</li>
            </ul>
          </div>

          <div className="search-stack">
            <label htmlFor="search">Search the atlas</label>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try git, react, docker, or prompt..."
              autoComplete="off"
            />
          </div>
        </aside>
      </section>

      <section className="filters" aria-label="Categories">
        {categories.map((category) => (
          <button
            key={category}
            className={category === activeCategory ? 'chip chip-active' : 'chip'}
            onClick={() => setActiveCategory(category)}
            aria-pressed={category === activeCategory}
            type="button"
          >
            {category}
          </button>
        ))}
      </section>

      <p className="results-count" role="status" aria-live="polite">
        {resultsLabel}
      </p>

      {filteredItems.length === 0 ? (
        <section className="empty-state" aria-label="No results">
          <h2>No cheat sheets match that search</h2>
          <p>Try a different word, or clear the filters to see everything.</p>
          <button type="button" className="copy-btn" onClick={clearFilters}>
            Clear filters
          </button>
        </section>
      ) : (
        <section className="grid" aria-label="Cheat sheets">
          {filteredItems.map((item) => {
            const state = copyState?.title === item.title ? copyState : null;

            return (
              <article key={item.title} className="card">
                <div className="card-top">
                  <span className="card-category">{item.category}</span>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                </div>

                {/* Focusable so keyboard users can scroll long, overflowing snippets. */}
                <pre tabIndex={0} aria-label={`${item.title} snippet`}>
                  <code>{item.snippet}</code>
                </pre>

                <div className="card-footer">
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="copy-btn"
                    aria-label={`Copy the ${item.title} snippet`}
                    onClick={() => copySnippet(item.title, item.snippet)}
                  >
                    {state ? (state.ok ? 'Copied' : 'Copy failed') : 'Copy'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="cta">
        <div>
          <p className="panel-title">Contribute</p>
          <h3>Missing a snippet? Add it to the data file and open a pull request.</h3>
        </div>
        <a href={REPO_DATA_URL} target="_blank" rel="noreferrer">
          Edit data.ts on GitHub
        </a>
      </section>
    </main>
  );
}
