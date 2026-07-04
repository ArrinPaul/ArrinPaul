import { useMemo, useState } from 'react';
import { categories, cheatSheets, featuredMetrics } from './data';

export default function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All');
  const [copiedTitle, setCopiedTitle] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cheatSheets.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.title, item.summary, item.snippet, item.tags.join(' ')].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const copySnippet = async (title: string, snippet: string) => {
    await navigator.clipboard.writeText(snippet);
    setCopiedTitle(title);
    window.setTimeout(() => setCopiedTitle(''), 1400);
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Open-source developer toolkit</p>
          <h1>Open Dev Atlas</h1>
          <p className="lede">
            An interactive cheat-sheet hub for modern developers. Search fast, copy instantly,
            and share it as a repo people actually fork.
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
            <p className="panel-title">Why this repo wins</p>
            <ul>
              <li>It is useful on day one.</li>
              <li>It is easy to fork and personalize.</li>
              <li>It looks polished in a pinned repo.</li>
            </ul>
          </div>

          <div className="search-stack">
            <label htmlFor="search">Search the atlas</label>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Git, React, Docker, or prompt..."
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
            type="button"
          >
            {category}
          </button>
        ))}
      </section>

      <section className="grid" aria-label="Cheat sheets">
        {filteredItems.map((item) => (
          <article key={item.title} className="card">
            <div className="card-top">
              <span className="card-category">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </div>

            <pre>
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

              <button type="button" className="copy-btn" onClick={() => copySnippet(item.title, item.snippet)}>
                {copiedTitle === item.title ? 'Copied' : 'Copy'}
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="cta">
        <div>
          <p className="panel-title">Next step</p>
          <h3>Turn this into a community repo with a clear roadmap and contributions guide.</h3>
        </div>
        <a href="https://github.com/new" target="_blank" rel="noreferrer">
          Publish it on GitHub
        </a>
      </section>
    </main>
  );
}