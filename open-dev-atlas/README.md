# Open Dev Atlas

> A shareable, interactive cheat-sheet hub for modern developers.

[![Stars](https://img.shields.io/github/stars/<owner>/<repo>?style=for-the-badge)](https://github.com/<owner>/<repo>/stargazers)
[![Forks](https://img.shields.io/github/forks/<owner>/<repo>?style=for-the-badge)](https://github.com/<owner>/<repo>/fork)
[![License](https://img.shields.io/github/license/<owner>/<repo>?style=for-the-badge)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/<owner>/<repo>?style=for-the-badge)](https://github.com/<owner>/<repo>/issues)

Open Dev Atlas is a polished, fork-friendly cheat-sheet experience for common developer workflows. It is designed to be useful on day one, easy to customize, and visually strong enough to stand out in a pinned repository.

## Features

- Searchable, category-based cheat sheets for Git, TypeScript, React, Node.js, Docker, and AI workflows.
- Copy-to-clipboard snippets for quick reuse.
- A clean, modern UI with a strong visual identity and responsive layout.
- Zero back-end dependency, which makes it easy to deploy on GitHub Pages.
- Content-first structure that encourages contributions and niche expansions.

## Tech Stack

- React
- TypeScript
- Vite
- GitHub Pages-ready static build

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## How to Customize

1. Edit `src/data.ts` to add new cheat sheets, commands, or workflow recipes.
2. Update `src/App.tsx` if you want to change layout, grouping, or card behavior.
3. Adjust `src/styles.css` to match your brand, color palette, and typography.
4. Replace the placeholder badges above with your real GitHub repository URL.

## How to Contribute

Contributions are welcome and encouraged.

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make your changes with clear commit messages.
4. Open a pull request with a short description of what changed and why.

Good first issues are a great fit for:

- Adding new categories or cheat-sheet items.
- Improving accessibility, color contrast, or keyboard support.
- Writing preset packs for specific frameworks or languages.
- Translating the content into another language.

## Roadmap

- Add favorites and local persistence.
- Add import/export for custom cheat-sheet packs.
- Add a command palette for faster navigation.
- Add a deploy workflow for GitHub Pages.

## License

Choose a license before public release. If you want maximum adoption, MIT is the simplest default.