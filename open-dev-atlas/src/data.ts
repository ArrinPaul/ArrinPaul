export const categories = [
  'All',
  'Git',
  'TypeScript',
  'React',
  'Node.js',
  'Docker',
  'AI',
] as const;

export type Category = (typeof categories)[number];

export type CheatSheetItem = {
  title: string;
  category: Exclude<Category, 'All'>;
  summary: string;
  snippet: string;
  tags: string[];
};

export const cheatSheets: CheatSheetItem[] = [
  {
    title: 'Review before you commit',
    category: 'Git',
    summary: 'Look at what changed and stage only what you meant to, instead of adding everything.',
    snippet:
      'git status\ngit diff\ngit add -p\ngit commit -m "feat: describe the change"\ngit push',
    tags: ['workflow', 'commit', 'review'],
  },
  {
    title: 'Typed fetch helper',
    category: 'TypeScript',
    summary: 'A small typed wrapper around fetch that fails with a readable error on HTTP errors.',
    snippet: [
      'async function getJson<T>(url: string): Promise<T> {',
      '  const res = await fetch(url);',
      '  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);',
      '  return (await res.json()) as T;',
      '}',
    ].join('\n'),
    tags: ['types', 'api', 'async'],
  },
  {
    title: 'Reusable React card',
    category: 'React',
    summary: 'A presentational component that stays composable by taking children.',
    snippet: [
      "import type { PropsWithChildren } from 'react';",
      '',
      'function Card({ title, children }: PropsWithChildren<{ title: string }>) {',
      '  return (',
      '    <article className="card">',
      '      <h2>{title}</h2>',
      '      {children}',
      '    </article>',
      '  );',
      '}',
    ].join('\n'),
    tags: ['ui', 'component', 'pattern'],
  },
  {
    title: 'Node.js env bootstrap',
    category: 'Node.js',
    summary: 'Load environment variables early and fail fast when required config is missing.',
    snippet: [
      "import 'dotenv/config';",
      '',
      'const apiKey = process.env.API_KEY;',
      "if (!apiKey) throw new Error('Missing API_KEY');",
    ].join('\n'),
    tags: ['runtime', 'config', 'env'],
  },
  {
    title: 'Docker dev container',
    category: 'Docker',
    summary: 'A minimal Node image for reproducible local development and CI parity.',
    snippet: [
      'FROM node:22-alpine',
      'WORKDIR /app',
      'COPY package*.json ./',
      'RUN npm ci',
      'COPY . .',
      'CMD ["npm", "run", "dev"]',
    ].join('\n'),
    tags: ['container', 'ci', 'reproducible'],
  },
  {
    title: 'Prompt starter pack',
    category: 'AI',
    summary: 'A concise prompt structure that gives better LLM output on technical tasks.',
    snippet: [
      'Role: You are a senior TypeScript reviewer.',
      'Goal: Find bugs in the code below.',
      'Constraints: Be concise and cite line numbers.',
      'Output format: A numbered list, most severe first.',
      'Example: <one input and the answer you expect>',
    ].join('\n'),
    tags: ['prompting', 'llm', 'productivity'],
  },
];

export const featuredMetrics = [
  { label: 'Cheat sheets', value: String(cheatSheets.length) },
  { label: 'Categories', value: String(categories.length - 1) },
  { label: 'Copy to clipboard', value: '1 click' },
];
