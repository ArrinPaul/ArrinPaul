export type CheatSheetItem = {
  title: string;
  category: string;
  summary: string;
  snippet: string;
  tags: string[];
};

export const categories = [
  'All',
  'Git',
  'TypeScript',
  'React',
  'Node.js',
  'Docker',
  'AI',
] as const;

export const featuredMetrics = [
  { label: 'Instant search', value: '0.2s' },
  { label: 'Copyable snippets', value: '1 click' },
  { label: 'Fork friendly', value: 'MIT ready' },
];

export const cheatSheets: CheatSheetItem[] = [
  {
    title: 'Git clean-up workflow',
    category: 'Git',
    summary: 'A safe way to review, stage, and ship a branch without noise.',
    snippet: 'git status && git add -A && git commit -m "feat: ship focused change" && git push',
    tags: ['workflow', 'commit', 'ship'],
  },
  {
    title: 'Typed fetch helper',
    category: 'TypeScript',
    summary: 'A tiny pattern for strongly typed API calls with readable errors.',
    snippet: 'const data = await fetch(url).then((res) => res.json() as Promise<MyType>);',
    tags: ['types', 'api', 'async'],
  },
  {
    title: 'Reusable React card',
    category: 'React',
    summary: 'A presentational component pattern that stays composable and clean.',
    snippet: 'function Card({ title, children }: PropsWithChildren<{ title: string }>) { /* ... */ }',
    tags: ['ui', 'component', 'pattern'],
  },
  {
    title: 'Node.js env bootstrap',
    category: 'Node.js',
    summary: 'Load environment variables early and fail fast when config is missing.',
    snippet: 'import "dotenv/config"; if (!process.env.API_KEY) throw new Error("Missing API_KEY");',
    tags: ['runtime', 'config', 'env'],
  },
  {
    title: 'Docker dev container',
    category: 'Docker',
    summary: 'A minimal image for reproducible local development and CI parity.',
    snippet: 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci',
    tags: ['container', 'ci', 'reproducible'],
  },
  {
    title: 'Prompt starter pack',
    category: 'AI',
    summary: 'A concise prompt structure for better LLM output in technical tasks.',
    snippet: 'Role + goal + constraints + output format + examples',
    tags: ['prompting', 'llm', 'productivity'],
  },
];