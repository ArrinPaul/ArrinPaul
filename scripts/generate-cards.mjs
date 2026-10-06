// Generates the profile cards as static SVG files from GitHub's own data, so the README does not depend
// on third-party image servers that go down or rate-limit.
//
//   assets/cards/stats.svg      totals for the last 12 months plus lifetime counts
//   assets/cards/streak.svg     total contributions, current and longest streak since the account started
//   assets/cards/languages.svg  language share across my own (non-fork) repositories, private ones included
//   assets/cards/activity.svg   daily contributions for the last 30 days
//   assets/cards/quote.svg      a programming quote that changes every day
//
// Safety: every card is built in memory first. If any API call fails nothing is written, so the old
// cards stay in place. Usage: GH_TOKEN=... node scripts/generate-cards.mjs [--dry-run]

import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const OUT = process.env.CARDS_DIR || 'assets/cards';
const DRY_RUN = process.argv.includes('--dry-run');
// In automation, refuse to publish numbers that cannot see private contributions.
const REQUIRE_PRIVATE = process.env.REQUIRE_PRIVATE === 'true';

const C = { bg: '#0d1117', border: '#30363d', title: '#58a6ff', text: '#c9d1d9', muted: '#8b949e', accent: '#3fb950', grid: '#21262d' };
const FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";

const QUOTES = [
  ['Premature optimization is the root of all evil.', 'Donald Knuth'],
  ['Programs must be written for people to read, and only incidentally for machines to execute.', 'Harold Abelson'],
  ['Simplicity is prerequisite for reliability.', 'Edsger W. Dijkstra'],
  ['Talk is cheap. Show me the code.', 'Linus Torvalds'],
  ['Make it work, make it right, make it fast.', 'Kent Beck'],
  ['First, solve the problem. Then, write the code.', 'John Johnson'],
  ['Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', 'Martin Fowler'],
  ['The most effective debugging tool is still careful thought, coupled with judiciously placed print statements.', 'Brian Kernighan'],
  ['The best way to predict the future is to invent it.', 'Alan Kay'],
  ['Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.', 'Antoine de Saint-Exupéry'],
  ['Deleted code is debugged code.', 'Jeff Sickel'],
  ['The only way to go fast is to go well.', 'Robert C. Martin'],
  ['Walking on water and developing software from a specification are easy if both are frozen.', 'Edward V. Berard'],
  ['Code is like humor. When you have to explain it, it is bad.', 'Cory House'],
];

if (!TOKEN) {
  console.error('GH_TOKEN (or GITHUB_TOKEN) is required.');
  process.exit(1);
}

async function gql(query, variables = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-cards' },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join('; ')}`);
      return json.data;
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, attempt * 1500)); // back off before retrying
    }
  }
  throw lastError;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => Number(n).toLocaleString('en-US');
const dayLabel = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function frame(w, h, title, body, desc) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<rect x="0.5" y="0.5" rx="8" width="${w - 1}" height="${h - 1}" fill="${C.bg}" stroke="${C.border}"/>
<style>text{font-family:${FONT}}.h{font-size:16px;font-weight:600;fill:${C.title}}.l{font-size:13px;fill:${C.text}}.v{font-size:13px;font-weight:600;fill:${C.text}}.m{font-size:11px;fill:${C.muted}}.big{font-size:28px;font-weight:700;fill:${C.text}}</style>
${body}
</svg>
`;
}

// ---------- data ----------

async function loadData() {
  const base = await gql(`query {
    viewer {
      login name createdAt
      followers { totalCount }
      pullRequests { totalCount }
      issues { totalCount }
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        totalCount
        nodes { isPrivate stargazerCount languages(first: 12, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
      }
      contributionsCollection {
        totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions totalIssueContributions
        restrictedContributionsCount
        contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
      }
    }
  }`);
  const v = base.viewer;
  const repos = v.repositories.nodes;
  if (REQUIRE_PRIVATE && repos.every((r) => !r.isPrivate)) {
    throw new Error('The token cannot see private repositories, so the numbers would be too low. Cards left unchanged.');
  }

  // Daily counts for the whole life of the account, one query per calendar year (API limit).
  const start = new Date(v.createdAt);
  const days = new Map();
  const now = new Date();
  for (let y = start.getUTCFullYear(); y <= now.getUTCFullYear(); y++) {
    const from = new Date(Date.UTC(y, 0, 1)).toISOString();
    const to = new Date(Math.min(Date.UTC(y, 11, 31, 23, 59, 59), now.getTime())).toISOString();
    const d = await gql(
      `query($from: DateTime!, $to: DateTime!) { viewer { contributionsCollection(from: $from, to: $to) { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`,
      { from, to },
    );
    for (const w of d.viewer.contributionsCollection.contributionCalendar.weeks)
      for (const day of w.contributionDays) days.set(day.date, day.contributionCount);
  }
  return { v, repos, days };
}

function streaks(days) {
  const dates = [...days.keys()].sort();
  const today = new Date().toISOString().slice(0, 10);
  let total = 0, longest = { len: 0, from: null, to: null }, run = { len: 0, from: null };
  for (const d of dates) {
    const n = days.get(d);
    total += n;
    if (n > 0) {
      if (run.len === 0) run.from = d;
      run.len++;
      if (run.len > longest.len) longest = { len: run.len, from: run.from, to: d };
    } else if (d !== today) {
      run = { len: 0, from: null }; // an empty day today does not end the streak yet
    }
  }
  // current streak: walk back from today (or yesterday if today is still empty)
  let current = { len: 0, from: null, to: null };
  const cursor = new Date(`${today}T00:00:00Z`);
  if ((days.get(today) || 0) === 0) cursor.setUTCDate(cursor.getUTCDate() - 1);
  const to = cursor.toISOString().slice(0, 10);
  while ((days.get(cursor.toISOString().slice(0, 10)) || 0) > 0) {
    current.len++;
    current.from = cursor.toISOString().slice(0, 10);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  if (current.len) current.to = to;
  const first = dates.find((d) => days.get(d) > 0) || dates[0];
  return { total, current, longest, since: first };
}

// ---------- cards ----------

function statsCard({ v, repos }) {
  const cc = v.contributionsCollection;
  const stars = repos.reduce((a, r) => a + r.stargazerCount, 0);
  const rows = [
    ['Contributions, last 12 months', cc.contributionCalendar.totalContributions],
    ['Commits, last 12 months', cc.totalCommitContributions],
    ['Pull requests, all time', v.pullRequests.totalCount],
    ['Code reviews, last 12 months', cc.totalPullRequestReviewContributions],
    ['Issues, all time', v.issues.totalCount],
    ['Stars earned', stars],
    ['Repositories', v.repositories.totalCount],
    ['Followers', v.followers.totalCount],
  ];
  const body = [`<text x="24" y="34" class="h">GitHub stats: ${esc(v.name || v.login)}</text>`];
  rows.forEach(([label, val], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 24 + col * 240, y = 66 + row * 30;
    body.push(`<text x="${x}" y="${y}" class="l">${esc(label)}</text><text x="${x + 215}" y="${y}" class="v" text-anchor="end">${fmt(val)}</text>`);
  });
  const priv = cc.restrictedContributionsCount;
  body.push(`<text x="24" y="196" class="m">Includes ${fmt(priv)} private contributions in the last 12 months. Updated ${new Date().toISOString().slice(0, 10)}.</text>`);
  return frame(495, 215, 'GitHub stats', body.join('\n'), 'Totals from GitHub: contributions, commits, pull requests, reviews, issues, stars, repositories and followers.');
}

function streakCard({ days }) {
  const s = streaks(days);
  const range = (r) => (r.len ? `${dayLabel(r.from)} - ${dayLabel(r.to)}` : 'No active streak');
  const col = (x, big, label, sub) =>
    `<text x="${x}" y="88" class="big" text-anchor="middle">${esc(big)}</text><text x="${x}" y="116" class="l" text-anchor="middle">${esc(label)}</text><text x="${x}" y="136" class="m" text-anchor="middle">${esc(sub)}</text>`;
  const body = [
    `<text x="24" y="34" class="h">Contribution streak</text>`,
    col(90, fmt(s.total), 'Total contributions', `since ${dayLabel(s.since)} ${s.since.slice(0, 4)}`),
    `<line x1="165" y1="60" x2="165" y2="150" stroke="${C.grid}"/>`,
    col(247, `${s.current.len}`, `Current streak (days)`, range(s.current)),
    `<line x1="330" y1="60" x2="330" y2="150" stroke="${C.grid}"/>`,
    col(412, `${s.longest.len}`, `Longest streak (days)`, range(s.longest)),
    `<text x="24" y="184" class="m">Private contributions included. An empty day today does not break the streak yet.</text>`,
  ];
  return frame(495, 200, 'Contribution streak', body.join('\n'), `Total ${s.total} contributions, current streak ${s.current.len} days, longest streak ${s.longest.len} days.`);
}

function languagesCard({ repos }) {
  const sizes = new Map(), colors = new Map();
  for (const r of repos)
    for (const e of r.languages.edges) {
      sizes.set(e.node.name, (sizes.get(e.node.name) || 0) + e.size);
      colors.set(e.node.name, e.node.color || '#8b949e');
    }
  const top = [...sizes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = [...sizes.values()].reduce((a, b) => a + b, 0) || 1;
  const body = [`<text x="24" y="34" class="h">Most used languages</text>`];
  // stacked bar
  let x = 24;
  const barW = 447;
  body.push(`<clipPath id="bar"><rect x="24" y="50" width="${barW}" height="10" rx="5"/></clipPath><g clip-path="url(#bar)">`);
  for (const [name, size] of top) {
    const w = (size / total) * barW;
    body.push(`<rect x="${x.toFixed(1)}" y="50" width="${w.toFixed(1)}" height="10" fill="${colors.get(name)}"/>`);
    x += w;
  }
  body.push('</g>');
  top.forEach(([name, size], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const px = 24 + col * 240, py = 90 + row * 26;
    body.push(`<circle cx="${px + 5}" cy="${py - 4}" r="5" fill="${colors.get(name)}"/><text x="${px + 18}" y="${py}" class="l">${esc(name)}</text><text x="${px + 215}" y="${py}" class="v" text-anchor="end">${((size / total) * 100).toFixed(1)}%</text>`);
  });
  body.push(`<text x="24" y="178" class="m">By code size across my own repositories (forks excluded, private included).</text>`);
  return frame(495, 195, 'Most used languages', body.join('\n'), `Top languages: ${top.map(([n]) => n).join(', ')}.`);
}

function activityCard({ days }) {
  const dates = [...days.keys()].sort().slice(-30);
  const vals = dates.map((d) => days.get(d));
  const max = Math.max(5, ...vals);
  const W = 800, H = 260, L = 48, R = 20, T = 56, B = 40;
  const px = (i) => L + (i * (W - L - R)) / (vals.length - 1);
  const py = (v) => T + (1 - v / max) * (H - T - B);
  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  const area = `${line} L${px(vals.length - 1).toFixed(1)} ${H - B} L${px(0).toFixed(1)} ${H - B} Z`;
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  const body = [
    `<text x="24" y="34" class="h">Contribution activity, last 30 days</text>`,
    `<text x="${W - 24}" y="34" class="m" text-anchor="end">${fmt(vals.reduce((a, b) => a + b, 0))} contributions</text>`,
    ...ticks.map((t) => `<line x1="${L}" y1="${py(t)}" x2="${W - R}" y2="${py(t)}" stroke="${C.grid}"/><text x="${L - 8}" y="${py(t) + 4}" class="m" text-anchor="end">${t}</text>`),
    `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.accent}" stop-opacity=".45"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></linearGradient>`,
    `<path d="${area}" fill="url(#g)"/><path d="${line}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linejoin="round"/>`,
    ...vals.map((v, i) => `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="${v > 0 ? 3 : 1.5}" fill="${v > 0 ? C.accent : C.muted}"><title>${esc(dayLabel(dates[i]))}: ${v}</title></circle>`),
    ...[0, 7, 14, 21, 29].map((i) => `<text x="${px(i).toFixed(1)}" y="${H - 14}" class="m" text-anchor="middle">${esc(dayLabel(dates[i]))}</text>`),
  ];
  return frame(W, H, 'Contribution activity', body.join('\n'), `Daily contributions between ${dates[0]} and ${dates[dates.length - 1]}.`);
}

function wrap(text, max) {
  const lines = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function quoteCard() {
  const doy = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  const [text, who] = QUOTES[doy % QUOTES.length];
  const lines = wrap(text, 64);
  const H = 70 + lines.length * 24;
  const body = [
    ...lines.map((l, i) => `<text x="400" y="${42 + i * 24}" class="l" font-size="16" text-anchor="middle" font-style="italic" style="font-size:16px">${i === 0 ? '“' : ''}${esc(l)}${i === lines.length - 1 ? '”' : ''}</text>`),
    `<text x="400" y="${H - 18}" class="m" text-anchor="middle">${esc(who)}</text>`,
  ];
  return { svg: frame(800, H, 'Quote of the day', body.join('\n'), `${text} ${who}`), text };
}

// ---------- main ----------

async function main() {
  const data = await loadData();
  const cards = {
    'stats.svg': statsCard(data),
    'streak.svg': streakCard(data),
    'languages.svg': languagesCard(data),
    'activity.svg': activityCard(data),
    'quote.svg': quoteCard().svg,
  };
  const s = streaks(data.days);
  console.log(`user=${data.v.login} repos=${data.repos.length} total=${s.total} current=${s.current.len} longest=${s.longest.len}`);
  if (DRY_RUN) {
    for (const [name, svg] of Object.entries(cards)) console.log(`${name}: ${svg.length} bytes`);
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, svg] of Object.entries(cards)) fs.writeFileSync(path.join(OUT, name), svg);
  console.log(`Wrote ${Object.keys(cards).length} cards to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
