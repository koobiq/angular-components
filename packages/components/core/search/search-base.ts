/** Unicode combining marks left behind by NFKD decomposition of accented characters, e.g. `é` → `e` + U+0301. */
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Normalizes a string for case- and diacritic-insensitive search comparison: trims the ends,
 * decomposes accented characters (NFKD), strips the resulting combining marks, and lowercases
 * using the current locale. Internal whitespace and punctuation are left untouched.
 */
export function normalizeSearchValue(value: string): string {
    if (typeof value !== 'string' || !value) return '';

    return value.trim().normalize('NFKD').replace(COMBINING_MARKS, '').toLocaleLowerCase();
}

const SEARCH_QUERY_TOKEN = /"([^"]*)"|(\S+)/g;

/**
 * Splits a raw query into tokens, treating whitespace as a separator and `"quoted phrases"` as
 * a single token (spaces inside the quotes are preserved). An unterminated quote degrades
 * gracefully into ordinary whitespace-separated tokens.
 */
export function tokenizeSearchQuery(query: string): string[] {
    if (typeof query !== 'string' || !query.trim()) return [];

    const tokens: string[] = [];

    for (const match of query.matchAll(SEARCH_QUERY_TOKEN)) {
        const token = match[1] ?? match[2];

        if (token) tokens.push(token);
    }

    return tokens;
}

/**
 * Builds a case- and diacritic-insensitive substring predicate for the given query. The query is
 * tokenized (bare words + `"quoted phrases"`) and every token must match (AND) against at least
 * one of the supplied haystacks (OR across fields) — pass a single string for a single-field
 * search, or an array for multi-field rows. An empty/whitespace-only query matches everything.
 */
export function createSearchPredicate(query: string): (value: string | readonly string[]) => boolean {
    const tokens = tokenizeSearchQuery(query)
        .map(normalizeSearchValue)
        .filter((token) => token.length > 0);

    if (!tokens.length) return () => true;

    return (value: string | readonly string[]): boolean => {
        const haystacks = (Array.isArray(value) ? value : [value]).map(normalizeSearchValue);

        return tokens.every((token) => haystacks.some((haystack) => haystack.includes(token)));
    };
}
