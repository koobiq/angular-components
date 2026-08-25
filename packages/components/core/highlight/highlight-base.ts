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

/**
 * @docs-private
 * `keyword` accepts either a single string or an array of strings — every keyword is
 * highlighted independently, which is what multi-token search queries need.
 */
export function highlight(value: unknown, keyword: unknown, mark: (text: string) => string): string {
    if (typeof value !== 'string') return '';

    const keywords = normalizeKeywords(keyword);

    if (!keywords.length) return escapeHtml(value);

    const pattern = keywords.map(escapeRegExp).join('|');
    const parts = value.split(new RegExp(`(${pattern})`, 'gi'));

    return parts
        .map((part, i) => {
            const escaped = escapeHtml(part);
            const isMatch = i % 2 === 1;

            return isMatch ? mark(escaped) : escaped;
        })
        .join('');
}
