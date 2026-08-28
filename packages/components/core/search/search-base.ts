/** Unicode combining marks left behind by NFKD decomposition of accented characters, e.g. `é` → `e` + U+0301. */
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * `й`/`Й` decompose under NFKD into `и`/`И` + a combining breve, same as any other diacritic. Unlike
 * Latin diacritics, that breve marks a distinct Cyrillic letter rather than an accented variant, so it's
 * re-composed after the generic strip instead of being folded away with the rest.
 */
const CYRILLIC_I_BREVE = /[иИ]̆/g;

/** The transformation behind {@link normalizeSearchValue}, minus the end-trimming — see {@link findSearchMatchRanges}. */
function foldDiacritics(value: string): string {
    return value
        .normalize('NFKD')
        .replace(CYRILLIC_I_BREVE, (match) => (match[0] === 'И' ? 'Й' : 'й'))
        .replace(COMBINING_MARKS, '')
        .toLocaleLowerCase();
}

/**
 * Normalizes a string for case- and diacritic-insensitive search comparison: trims the ends,
 * decomposes accented characters (NFKD), strips the resulting combining marks (while preserving
 * `й`/`Й` as distinct letters), and lowercases using the current locale. Internal whitespace and
 * punctuation are left untouched.
 */
export function normalizeSearchValue(value: string): string {
    if (typeof value !== 'string' || !value) return '';

    return foldDiacritics(value.trim());
}

/**
 * Locates every case- and diacritic-insensitive match of `tokens` in `value`, returning `[start, end)`
 * ranges in `value`'s own (unfolded) coordinates — overlapping or adjacent ranges are merged. This is
 * what a highlighter needs to stay in sync with {@link createSearchPredicate}: matching a folded value
 * like `cafe` against `Café` only tells you *that* it matched, not *where* in the original string to
 * mark, since folding can change which letters look alike without changing the string's length.
 */
export function findSearchMatchRanges(value: string, tokens: readonly string[]): Array<[number, number]> {
    const normalizedTokens = tokens.map(normalizeSearchValue).filter((token) => token.length > 0);

    if (typeof value !== 'string' || !normalizedTokens.length) return [];

    // Folding is applied one UTF-16 code unit at a time so every character of the normalized value can be
    // traced back to the original index it came from — this is what makes mapping a match's position back
    // onto `value` possible. Surrogate pairs are folded as two independent units; neither combining-mark
    // stripping nor case-folding depends on cross-surrogate context, so this doesn't affect correctness.
    let normalizedValue = '';
    const originalIndexOf: number[] = [];

    for (let index = 0; index < value.length; index++) {
        const folded = foldDiacritics(value[index]);

        normalizedValue += folded;

        for (let i = 0; i < folded.length; i++) originalIndexOf.push(index);
    }

    const ranges: Array<[number, number]> = [];

    for (const token of normalizedTokens) {
        let fromIndex = 0;
        let matchIndex: number;

        while ((matchIndex = normalizedValue.indexOf(token, fromIndex)) !== -1) {
            ranges.push([originalIndexOf[matchIndex], originalIndexOf[matchIndex + token.length - 1] + 1]);
            fromIndex = matchIndex + token.length;
        }
    }

    return mergeRanges(ranges);
}

function mergeRanges(ranges: Array<[number, number]>): Array<[number, number]> {
    if (ranges.length < 2) return ranges;

    const sorted = [...ranges].sort(([aStart, aEnd], [bStart, bEnd]) => aStart - bStart || aEnd - bEnd);
    const merged: Array<[number, number]> = [sorted[0]];

    for (const [start, end] of sorted.slice(1)) {
        const last = merged[merged.length - 1];

        if (start <= last[1]) {
            last[1] = Math.max(last[1], end);
        } else {
            merged.push([start, end]);
        }
    }

    return merged;
}

const SEARCH_QUERY_TOKEN = /"([^"]*)"|(\S+)/g;

/**
 * Splits a raw query into tokens, treating whitespace as a separator and `"quoted phrases"` as
 * a single token (spaces inside the quotes are preserved). A `"` with no matching closing quote
 * stays part of its token instead of being dropped, so a half-open quote yields a token no
 * realistic haystack contains — and therefore no results — until the quote is closed.
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
