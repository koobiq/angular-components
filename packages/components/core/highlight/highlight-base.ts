import { findSearchMatchRanges } from '../search/search-base';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as const;
const HTML_SPECIAL_CHARS = /[&<>"']/;
const HTML_SPECIAL_CHARS_GLOBAL = new RegExp(HTML_SPECIAL_CHARS.source, 'g');

/** Escapes characters in the specified string that have special meaning in a regular expression. */
export function escapeRegExp(value: string): string {
    if (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return value;
}

function escapeHtml(value: string): string {
    if (!HTML_SPECIAL_CHARS.test(value)) return value;

    return value.replace(HTML_SPECIAL_CHARS_GLOBAL, (chr) => HTML_ESCAPES[chr] ?? chr);
}

function normalizeKeywords(keyword: unknown): string[] {
    const list = Array.isArray(keyword) ? keyword : [keyword];

    // Longest first, so a shorter keyword (e.g. "a") can't shadow a longer one that starts
    // with it (e.g. "all") within the same regex alternation.
    return list
        .filter((item): item is string => typeof item === 'string' && item.length > 0)
        .sort((a, b) => b.length - a.length);
}

function findLiteralMatchRanges(value: string, keywords: string[]): Array<[number, number]> {
    const pattern = new RegExp(keywords.map(escapeRegExp).join('|'), 'gi');
    const ranges: Array<[number, number]> = [];
    let match: RegExpExecArray | null = pattern.exec(value);

    while (match !== null) {
        ranges.push([match.index, match.index + match[0].length]);
        match = pattern.exec(value);
    }

    return ranges;
}

/**
 * @docs-private
 * `keyword` accepts either a single string or an array of strings — every keyword is
 * highlighted independently, which is what multi-token search queries need.
 *
 * By default, matching is literal (case-insensitive substring), same as a plain `.includes`. Pass
 * `foldDiacritics: true` when the keywords were matched with diacritic folding (e.g. via
 * {@link createSearchPredicate} from `@koobiq/components/core`) — otherwise a folded match like
 * `cafe` finding `Café` has nothing in the value for a literal highlighter to mark.
 */
export function highlight(
    value: unknown,
    keyword: unknown,
    mark: (text: string) => string,
    foldDiacritics = false
): string {
    if (typeof value !== 'string') return '';

    const keywords = normalizeKeywords(keyword);

    if (!keywords.length) return escapeHtml(value);

    const ranges = foldDiacritics ? findSearchMatchRanges(value, keywords) : findLiteralMatchRanges(value, keywords);

    if (!ranges.length) return escapeHtml(value);

    let result = '';
    let cursor = 0;

    for (const [start, end] of ranges) {
        result += escapeHtml(value.slice(cursor, start));
        result += mark(escapeHtml(value.slice(start, end)));
        cursor = end;
    }

    return result + escapeHtml(value.slice(cursor));
}
