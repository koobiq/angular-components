/**
 * Escapes a string for a single-quoted string literal inside an `[attr]="..."` binding. The binding's own
 * value is itself HTML-attribute text delimited by `"`, so a literal `"` in a type like `"full" | "short"`
 * has to be entity-escaped too, or it closes the attribute early and corrupts everything after it — not
 * just a JS-string escape, which only protects against the JS string delimiter (`'`). `&` goes first, so
 * an intersection type is not read as the start of an entity. A `'` becomes `'`, not `\'`: Angular
 * looks for a `//` comment by counting quotes and does not skip escaped ones, so `'https://…'` in the code
 * would cut the expression short.
 */
const escapeExpressionString = (text: string): string =>
    text
        .replace(/&/g, '&amp;')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\u0027')
        .replace(/\n/g, '\\n')
        .replace(/"/g, '&quot;');

interface CodeBlockOptions {
    /** The highlight.js language, `plaintext` for plain text. */
    language: string;
    extraClass?: string;
    lineNumbers?: boolean;
}

/**
 * A `kbq-code-block` the way the API page renders every block of code — signatures, imports and the code
 * in JSDoc alike. The file is bound inline: a generated page has no class field to bind it from.
 */
export function renderCodeBlock(content: string, { language, extraClass, lineNumbers }: CodeBlockOptions): string {
    const file = `{content: '${escapeExpressionString(content)}', language: '${escapeExpressionString(language)}'}`;

    return `<kbq-code-block class="docs-code-block${extraClass ? ` ${extraClass}` : ''}" filled${lineNumbers ? ' lineNumbers' : ''} [files]="[${file}]" />`;
}
