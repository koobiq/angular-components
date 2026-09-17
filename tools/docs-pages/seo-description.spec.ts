import { extractSeoDescription } from './seo-description';

describe(extractSeoDescription.name, () => {
    it('returns visible plain text from the first paragraph', () => {
        expect(
            extractSeoDescription(
                'Use the [`KbqButton`](https://example.com) component with `<button>` elements.\n\n### Next section'
            )
        ).toBe('Use the KbqButton component with <button> elements.');
    });

    it('returns null when a document has no paragraph', () => {
        expect(extractSeoDescription('### Section')).toBeNull();
    });

    it('accepts an introduction after a document title but not a paragraph from a subsection', () => {
        expect(extractSeoDescription('## Guide\n\nGuide introduction.\n\n### Details\n\nDetails text.')).toBe(
            'Guide introduction.'
        );
        expect(extractSeoDescription('### Details\n\nDetails text.')).toBeNull();
    });

    // The comments of MDX are for the tools, such as cspell and prettier, and the page does not show them.
    it('leaves comments out of the description', () => {
        expect(
            extractSeoDescription('{/* cspell:ignore arrowless */}\n\nArrowless {/* prettier-ignore */} popover.')
        ).toBe('Arrowless popover.');
    });

    it('separates the words of HTML elements', () => {
        expect(extractSeoDescription('Press<kbd>Esc</kbd>to close.')).toBe('Press Esc to close.');
    });

    it('names the page and the position of a syntax error', () => {
        expect(() => extractSeoDescription('Intro <!-- x -->', 'alert.en.mdx')).toThrow('alert.en.mdx:1:8:');
    });

    it('decodes each HTML entity only once', () => {
        expect(extractSeoDescription('&amp;quot; &amp;lt; &quot; &lt;')).toBe('&quot; &lt; " <');
    });

    it('preserves angle brackets and underscores from visible text', () => {
        expect(extractSeoDescription('Use `<button>`, `<a>`, and `KBQ_WINDOW`.')).toBe(
            'Use <button>, <a>, and KBQ_WINDOW.'
        );
    });

    it('truncates long descriptions without splitting a word', () => {
        const description = extractSeoDescription('word '.repeat(60));

        expect(description!.length).toBeLessThanOrEqual(200);
        expect(description!.endsWith('…')).toBe(true);
    });

    it('does not truncate a description at the maximum length', () => {
        const description = 'a'.repeat(200);

        expect(extractSeoDescription(description)).toBe(description);
    });
});
