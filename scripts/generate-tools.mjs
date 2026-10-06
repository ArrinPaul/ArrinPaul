// Builds assets/cards/tools.svg: a "skill wall" of chips grouped by colour, with no outside images or services.
// Edit the TOOLS list below and run: node scripts/generate-tools.mjs
//
// Only list tools that are really used. The workflow regenerates the file when this script changes.

import fs from 'node:fs';
import path from 'node:path';

const OUT = process.env.CARDS_DIR || 'assets/cards';
// Brand logos (path data from Simple Icons) are embedded in the image. Tools without a logo get a monogram.
const LOGOS = JSON.parse(fs.readFileSync(new URL('./tool-logos.json', import.meta.url), 'utf8'));
const MONOGRAM = { BullMQ: 'BQ', Genkit: 'Gk', AWS: 'aws', Playwright: 'Pw' };
// Very dark brand colours disappear on a dark card, so those logos are drawn in light grey.
const lum = (hex) => { const n = parseInt(hex, 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
const logoColor = (hex) => (lum(hex) < 0.3 ? '#c9d1d9' : '#' + hex);

const GROUPS = [
  { name: 'Languages', color: '#58a6ff', tools: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C', 'HTML', 'CSS', 'LaTeX'] },
  { name: 'Frontend', color: '#3fb950', tools: ['React', 'Next.js', 'Angular', 'Vite', 'Tailwind CSS', 'Three.js'] },
  { name: 'Backend', color: '#d29922', tools: ['Node.js', 'Express', 'NestJS', 'FastAPI', 'Spring Boot', 'Socket.IO', 'BullMQ'] },
  { name: 'Data', color: '#f778ba', tools: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'Convex', 'Drizzle ORM'] },
  { name: 'AI and ML', color: '#a371f7', tools: ['PyTorch', 'TensorFlow', 'OpenCV', 'scikit-learn', 'NumPy', 'pandas', 'MediaPipe', 'Gemini API', 'Genkit'] },
  { name: 'Services', color: '#79c0ff', tools: ['Clerk', 'Stripe', 'n8n'] },
  { name: 'DevOps and testing', color: '#ffa657', tools: ['Docker', 'GitHub Actions', 'Vercel', 'Nginx', 'AWS', 'Git', 'GitHub', 'pnpm', 'Turborepo', 'Jest', 'Vitest', 'Playwright', 'Zod'] },
];

const W = 800, PAD = 24, CHIP_H = 28, GAP = 8, FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Rough text width for 13px sans-serif; chips are padded so a small error never clips the label.
const textW = (s) => Math.round(s.length * 7.7 + 4);

function icon(name, ix, iy, accent) {
  const logo = LOGOS[name];
  if (logo) return `<path transform="translate(${ix} ${iy}) scale(0.667)" d="${logo.d}" fill="${logoColor(logo.hex)}"/>`;
  const m = MONOGRAM[name] || name.slice(0, 2);
  return `<rect x="${ix}" y="${iy}" width="16" height="16" rx="4" fill="none" stroke="${accent}"/><text x="${ix + 8}" y="${iy + 11}" text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:${accent}">${esc(m)}</text>`;
}

let y = 70;
const parts = [];
// Legend
let lx = PAD;
for (const g of GROUPS) {
  parts.push(`<circle cx="${lx + 5}" cy="40" r="5" fill="${g.color}"/><text x="${lx + 16}" y="44" class="m">${esc(g.name)}</text>`);
  lx += 16 + textW(g.name) + 18;
}
// Chips: grouped in order, wrapping at the card width
let x = PAD;
for (const g of GROUPS) {
  for (const t of g.tools) {
    const w = textW(t) + 48;
    if (x + w > W - PAD) { x = PAD; y += CHIP_H + GAP; }
    parts.push(
      `<g><rect x="${x}" y="${y}" width="${w}" height="${CHIP_H}" rx="14" fill="#161b22" stroke="${g.color}" stroke-opacity=".55"/>` +
        icon(t, x + 10, y + 6, g.color) +
        `<text x="${x + 33}" y="${y + 18}" class="c">${esc(t)}</text></g>`,
    );
    x += w + GAP;
  }
}
const H = y + CHIP_H + PAD;
const count = GROUPS.reduce((a, g) => a + g.tools.length, 0);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
<title id="t">Tools and frameworks</title><desc id="d">${esc(GROUPS.map((g) => `${g.name}: ${g.tools.join(', ')}`).join('. '))}</desc>
<rect x="0.5" y="0.5" rx="8" width="${W - 1}" height="${H - 1}" fill="#0d1117" stroke="#30363d"/>
<style>text{font-family:${FONT}}.h{font-size:16px;font-weight:600;fill:#58a6ff}.m{font-size:11px;fill:#8b949e}.c{font-size:13px;fill:#c9d1d9}</style>
<text x="${PAD}" y="${PAD - 2}" class="h">Tools and frameworks</text>
${parts.join('\n')}
</svg>
`;
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'tools.svg'), svg);
console.log(`Wrote ${OUT}/tools.svg with ${count} tools (${W}x${H})`);
