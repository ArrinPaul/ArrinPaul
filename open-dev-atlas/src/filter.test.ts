import { describe, expect, it } from 'vitest';
import { categories, cheatSheets } from './data';
import { filterCheatSheets } from './filter';

describe('filterCheatSheets', () => {
  it('returns everything for an empty query and the All category', () => {
    expect(filterCheatSheets(cheatSheets, '', 'All')).toHaveLength(cheatSheets.length);
  });

  it('ignores whitespace-only queries', () => {
    expect(filterCheatSheets(cheatSheets, '   ', 'All')).toHaveLength(cheatSheets.length);
  });

  it('filters by category', () => {
    const result = filterCheatSheets(cheatSheets, '', 'Docker');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === 'Docker')).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(filterCheatSheets(cheatSheets, 'DOCKER', 'All').length).toBeGreaterThan(0);
  });

  it('matches on the category name, not only on title and text', () => {
    const result = filterCheatSheets(cheatSheets, 'typescript', 'All');
    expect(result.some((item) => item.category === 'TypeScript')).toBe(true);
  });

  it('matches on tags', () => {
    expect(filterCheatSheets(cheatSheets, 'prompting', 'All').map((i) => i.category)).toContain(
      'AI',
    );
  });

  it('requires every word to match, in any order', () => {
    const forward = filterCheatSheets(cheatSheets, 'git commit', 'All');
    const reversed = filterCheatSheets(cheatSheets, 'commit git', 'All');
    expect(forward.length).toBeGreaterThan(0);
    expect(reversed).toEqual(forward);
    expect(filterCheatSheets(cheatSheets, 'git docker', 'All')).toHaveLength(0);
  });

  it('combines the category and the query', () => {
    expect(filterCheatSheets(cheatSheets, 'docker', 'Git')).toHaveLength(0);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterCheatSheets(cheatSheets, 'zzzz-no-match', 'All')).toEqual([]);
  });
});

describe('cheat sheet data', () => {
  it('has unique titles, which the UI uses as React keys', () => {
    const titles = cheatSheets.map((item) => item.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('only uses declared categories', () => {
    for (const item of cheatSheets) {
      expect(categories).toContain(item.category);
    }
  });

  it('has a non-empty snippet, summary and tags for every item', () => {
    for (const item of cheatSheets) {
      expect(item.snippet.trim()).not.toBe('');
      expect(item.summary.trim()).not.toBe('');
      expect(item.tags.length).toBeGreaterThan(0);
    }
  });
});
