import { DocsMarkdownRenderer } from './docs-marked-renderer';

describe(DocsMarkdownRenderer.name, () => {
    /** `finalizeOutput` is where the renderer aliases tag names across the finished document. */
    const finalize = (html: string): string => new DocsMarkdownRenderer().finalizeOutput(html);

    // `marked` hands raw HTML through untouched, so a guide's own markup is what reaches the tag
    // aliasing — including the spacing a generated document would never produce.
    it('should alias a whole tag written with whitespace before the closing bracket', () => {
        expect(finalize('<p >spaced</p>')).toBe('<p class="kbq-markdown__p">spaced</p>');
        expect(finalize('<th\t>spaced</th>')).toBe('<th class="kbq-markdown__th">spaced</th>');
    });

    // The reason `th` and `p` are aliased on the whole tag rather than on the opening `<th`/`<p`:
    // `thead` and `pre` start with them and have aliases of their own to keep.
    it('should leave a tag whose name merely starts with a whole-tag name to its own alias', () => {
        expect(finalize('<thead><th>a</th></thead>')).toBe(
            '<thead class="kbq-markdown__thead"><th class="kbq-markdown__th">a</th></thead>'
        );
        expect(finalize('<pre><code>x</code></pre>')).toBe(
            '<pre class="kbq-markdown__pre"><code class="kbq-markdown__code">x</code></pre>'
        );
    });
});
