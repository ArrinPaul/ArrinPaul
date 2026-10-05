import type { Category, CheatSheetItem } from './data';

/**
 * Returns the cheat sheets that match the selected category and the search text.
 *
 * The search is case-insensitive and split on whitespace. Every word must match
 * somewhere in the title, summary, snippet, category or tags, so "git commit"
 * and "commit git" behave the same.
 */
export function filterCheatSheets(
  items: readonly CheatSheetItem[],
  query: string,
  category: Category,
): CheatSheetItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return items.filter((item) => {
    if (category !== 'All' && item.category !== category) return false;
    if (terms.length === 0) return true;

    const haystack = [item.title, item.summary, item.snippet, item.category, ...item.tags]
      .join(' ')
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}
