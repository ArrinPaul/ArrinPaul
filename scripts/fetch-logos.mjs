// One-time helper: downloads brand logos from the open-source Simple Icons set (CC0 artwork; the logos
// remain trademarks of their owners) and stores the path data in scripts/tool-logos.json, so the tools
// image can embed them without loading anything from outside when it is viewed.
// Usage: node scripts/fetch-logos.mjs
import fs from 'node:fs';

const SLUGS = {
  Python: 'python', TypeScript: 'typescript', JavaScript: 'javascript', Java: 'openjdk', C: 'c', HTML: 'html5', CSS: 'css',
  LaTeX: 'latex', React: 'react', 'Next.js': 'nextdotjs', Angular: 'angular', Vite: 'vite', 'Tailwind CSS': 'tailwindcss',
  'Three.js': 'threedotjs', 'Node.js': 'nodedotjs', Express: 'express', NestJS: 'nestjs', FastAPI: 'fastapi',
  'Spring Boot': 'springboot', 'Socket.IO': 'socketdotio', PostgreSQL: 'postgresql', MongoDB: 'mongodb', Redis: 'redis',
  Supabase: 'supabase', Firebase: 'firebase', Convex: 'convex', 'Drizzle ORM': 'drizzle', PyTorch: 'pytorch',
  TensorFlow: 'tensorflow', OpenCV: 'opencv', 'scikit-learn': 'scikitlearn', NumPy: 'numpy', pandas: 'pandas',
  MediaPipe: 'mediapipe', 'Gemini API': 'googlegemini', Clerk: 'clerk', Stripe: 'stripe', n8n: 'n8n', Docker: 'docker',
  'GitHub Actions': 'githubactions', Vercel: 'vercel', Nginx: 'nginx', Git: 'git', GitHub: 'github', pnpm: 'pnpm',
  Turborepo: 'turborepo', Jest: 'jest', Vitest: 'vitest', Zod: 'zod',
};
const CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@latest';
const meta = await (await fetch(`${CDN}/data/simple-icons.json`)).json();
const hexOf = new Map(meta.map((m) => [m.slug ?? m.title, m.hex]));
const out = {};
for (const [tool, slug] of Object.entries(SLUGS)) {
  const svg = await (await fetch(`${CDN}/icons/${slug}.svg`)).text();
  const d = svg.match(/<path d="([^"]+)"/)?.[1];
  if (!d) throw new Error(`No path for ${tool} (${slug})`);
  out[tool] = { d, hex: hexOf.get(slug) || 'c9d1d9' };
}
fs.writeFileSync('scripts/tool-logos.json', JSON.stringify(out));
console.log(`Saved ${Object.keys(out).length} logos`);
