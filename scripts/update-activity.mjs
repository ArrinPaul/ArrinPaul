// Builds the "coding activity" block of the profile README from GitHub's own data.
//
// Counting rules (stated in the generated block so the numbers can be checked):
//   * A commit counts once, no matter how many branches it appears on (de-duplicated by SHA).
//   * Only commits authored by the profile owner count (matched by GitHub account).
//   * Forks are skipped. Private repositories are included only if the token can read them.
//   * Times of day are shown in ACTIVITY_TZ (default Asia/Kolkata).
//
// Usage: GH_TOKEN=... node scripts/update-activity.mjs [--dry-run]

import fs from 'node:fs';

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'ArrinPaul';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const TZ = process.env.ACTIVITY_TZ || 'Asia/Kolkata';
const README = process.env.README_PATH || 'README.md';
const DRY_RUN = process.argv.includes('--dry-run');
// In automation, refuse to publish numbers built from public repos only: they would be lower than before.
const REQUIRE_PRIVATE = process.env.REQUIRE_PRIVATE === 'true';

const START = '<!--START_SECTION:activity-->';
const END = '<!--END_SECTION:activity-->';
const BAR_WIDTH = 25;

if (!TOKEN) {
  console.error('GH_TOKEN (or GITHUB_TOKEN) is required.');
  process.exit(1);
}

async function api(path) {
  // Retry temporary failures (network errors, 5xx, rate limiting) a few times before giving up.
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await apiOnce(path);
    } catch (e) {
      lastError = e;
      if (!/GitHub API (5dd|429|403)|fetch failed/.test(String(e.message))) throw e;
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  throw lastError;
}

async function apiOnce(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'profile-activity-script',
    },
  });
  if (res.status === 409) return []; // empty repository
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function paginate(path) {
  const items = [];
  for (let page = 1; ; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const batch = await api(`${path}${sep}per_page=100&page=${page}`);
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

async function listRepos() {
  // /user/repos includes private repos the token can read; fall back to the public listing.
  let repos;
  try {
    repos = await paginate('/user/repos?affiliation=owner&visibility=all');
    repos = repos.filter((r) => r.owner.login.toLowerCase() === OWNER.toLowerCase());
  } catch {
    repos = [];
  }
  if (repos.length === 0) repos = await paginate(`/users/${OWNER}/repos?type=owner`);
  return repos.filter((r) => !r.fork);
}

export function bar(share) {
  const filled = Math.round(share * BAR_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

export function row(label, count, unit, total) {
  const share = total ? count / total : 0;
  return `${label.padEnd(24)} ${`${count} ${unit}`.padEnd(19)} ${bar(share)}   ${(share * 100).toFixed(2).padStart(5, '0')} % `;
}

export function slotOf(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'daytime';
  if (hour >= 18) return 'evening';
  return 'night';
}

export function buildBlock({ commits, repoCount, languages, publicOnly }) {
  const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' });
  const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long' });

  const slots = { morning: 0, daytime: 0, evening: 0, night: 0 };
  const days = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
  for (const iso of commits) {
    const d = new Date(iso);
    slots[slotOf(Number(hourFmt.format(d)))]++;
    days[dayFmt.format(d)]++;
  }
  const total = commits.length;

  const slotInfo = {
    morning: ['Morning', "I'm an Early Bird"],
    daytime: ['Daytime', "I'm a Daytime Coder"],
    evening: ['Evening', "I'm an Evening Coder"],
    night: ['Night', "I'm a Night Owl"],
  };
  const topSlot = Object.entries(slots).sort((a, b) => b[1] - a[1])[0][0];
  const topDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0][0];
  const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const langTotal = langEntries.reduce((a, [, n]) => a + n, 0);

  const out = [];
  out.push(`**${slotInfo[topSlot][1]}**`, '', '```text');
  for (const key of ['morning', 'daytime', 'evening', 'night']) out.push(row(slotInfo[key][0], slots[key], 'commits', total));
  out.push('```', `**I'm Most Productive on ${topDay}**`, '', '```text');
  for (const [name, n] of Object.entries(days)) out.push(row(name, n, 'commits', total));
  out.push('```', '');
  if (langEntries.length > 0) {
    out.push(`**I Mostly Code in ${langEntries[0][0]}**`, '', '```text');
    for (const [name, n] of langEntries.slice(0, 6)) out.push(row(name, n, n === 1 ? 'repo' : 'repos', langTotal));
    out.push('```', '');
  }
  const scope = publicOnly ? 'public repositories' : 'public and private repositories';
  out.push(
    `<sub>Based on ${total} commits across ${repoCount} ${scope} (own repos, no forks). Each commit is counted once, even if it is on several branches. Times are in ${TZ}.</sub>`,
  );
  return out.join('\n');
}

async function main() {
  const login = (await api('/user').catch(() => ({ login: OWNER }))).login || OWNER;
  const repos = await listRepos();
  const publicOnly = repos.every((r) => !r.private);
  if (REQUIRE_PRIVATE && publicOnly) {
    throw new Error(
      'The token can only see public repositories, so the totals would be lower than the real ones. ' +
        'Use a token with the "repo" scope as the GH_TOKEN secret. README left unchanged.',
    );
  }

  const seen = new Set();
  const commits = [];
  const languages = {};
  let counted = 0;

  for (const repo of repos) {
    if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
    const branches = await paginate(`/repos/${repo.full_name}/branches`).catch(() => []);
    let repoHasCommits = false;
    for (const b of branches) {
      const list = await paginate(
        `/repos/${repo.full_name}/commits?sha=${encodeURIComponent(b.name)}&author=${encodeURIComponent(OWNER)}`,
      ).catch(() => []);
      for (const c of list) {
        if (seen.has(c.sha)) continue;
        seen.add(c.sha);
        commits.push(c.commit.author.date);
        repoHasCommits = true;
      }
    }
    if (repoHasCommits) counted++;
  }

  const block = buildBlock({ commits, repoCount: repos.length, languages, publicOnly });
  console.log(`user=${login} repos=${repos.length} (with commits: ${counted}) unique commits=${commits.length} publicOnly=${publicOnly}`);

  const readme = fs.readFileSync(README, 'utf8').replace(/\r\n/g, '\n');
  const re = new RegExp(`${START}[\\s\\S]*?${END}`);
  if (!re.test(readme)) throw new Error(`Markers ${START} / ${END} not found in ${README}`);
  const next = readme.replace(re, `${START}\n${block}\n${END}`);

  if (DRY_RUN) {
    console.log('\n--- generated block ---\n' + block);
    return;
  }
  if (next === readme) {
    console.log('No changes.');
    return;
  }
  fs.writeFileSync(README, next);
  console.log('README updated.');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('update-activity.mjs')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
