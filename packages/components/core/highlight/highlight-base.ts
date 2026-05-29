const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as const;
const HTML_SPECIAL_CHARS = /[&<>"']/;
const HTML_SPECIAL_CHARS_GLOBAL = new RegExp(HTML_SPECIAL_CHARS.source, 'g');

export function escapeRegExp(value: string) {
    if (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return value;
}

function escapeHtml(value: string): string {
    if (!HTML_SPECIAL_CHARS.test(value)) return value;

    return value.replace(HTML_SPECIAL_CHARS_GLOBAL, (chr) => HTML_ESCAPES[chr] ?? chr);
}

/** @docs-private */
export function highlight(value: any, args: any, mark: (text: string) => string): string {
    if (typeof value !== 'string') return '';
    if (!args || typeof args !== 'string') return escapeHtml(value);

    const parts = value.split(new RegExp(`(${escapeRegExp(args)})`, 'gi'));

    return parts
        .map((part, i) => {
            const escaped = escapeHtml(part);
            const isMatch = i % 2 === 1;

            return isMatch ? mark(escaped) : escaped;
        })
        .join('');
}
