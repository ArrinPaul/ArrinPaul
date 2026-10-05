# Open Dev Atlas

> A searchable, interactive cheat-sheet hub for modern developers.

[![CI](https://github.com/ArrinPaul/ArrinPaul/actions/workflows/open-dev-atlas-ci.yml/badge.svg)](https://github.com/ArrinPaul/ArrinPaul/actions/workflows/open-dev-atlas-ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

Open Dev Atlas is a small single-page app of copy-ready snippets for everyday developer work. It is fully static, so it needs no back end and can be hosted anywhere that serves files.

> This project lives in the `open-dev-atlas/` folder of the [ArrinPaul/ArrinPaul](https://github.com/ArrinPaul/ArrinPaul) profile repository. All commands below are run from inside that folder.

## Features

- Cheat sheets for Git, TypeScript, React, Node.js, Docker and AI prompting.
- Search across title, summary, snippet, category and tags. Every word must match, in any order.
- Category filter chips, a live result count and a clear empty state.
- One-click copy with a fallback for browsers that block the async Clipboard API, and a visible "Copy failed" state.
- Keyboard and screen-reader friendly: pressed states on chips, labelled buttons, focusable code blocks and visible focus rings.
- Responsive layout, and reduced-motion support.

## Getting started

Requires Node.js 18 or newer.

```bash
cd open-dev-atlas
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check, then create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check without building |
| `npm test` | Run the unit and component tests (Vitest, Testing Library) |

## Adding a cheat sheet

Add an object to `cheatSheets` in `src/data.ts`:

```ts
{
  title: 'Undo the last commit',
  category: 'Git',            // must be one of the categories in the same file
  summary: 'Move HEAD back one commit and keep your changes staged.',
  snippet: 'git reset --soft HEAD~1',
  tags: ['undo', 'commit'],
}
```

Titles must be unique, and the tests check that every item has a valid category, a snippet, a summary and at least one tag. To add a category, add it to the `categories` array first.

## Deploying

The build is static. To host it under a sub-path, set `BASE_PATH` when building, for example for GitHub Pages:

```bash
BASE_PATH=/ArrinPaul/ npm run build
```

Then publish the contents of `dist/`. There is no deploy workflow in this repository yet.

## Project structure

```text
open-dev-atlas/
├── src/
│   ├── App.tsx          UI: search, filters, cards, copy buttons
│   ├── data.ts          Categories and cheat sheet content
│   ├── filter.ts        Search and category filtering
│   ├── clipboard.ts     Copy to clipboard with a fallback
│   ├── *.test.ts(x)     Tests
│   └── styles.css
├── index.html
├── vite.config.ts
└── tsconfig*.json
```

## Contributing

1. Fork the repository and create a branch.
2. Make your change, and run `npm run typecheck`, `npm test` and `npm run build`.
3. Open a pull request describing what changed and why.

Good first contributions: new snippets, new categories, accessibility improvements and translations.

## Roadmap

- Favorites with local persistence.
- Import and export of custom cheat-sheet packs.
- A command palette for faster navigation.
- A GitHub Pages deploy workflow.

## License

Released under the [MIT License](./LICENSE).
