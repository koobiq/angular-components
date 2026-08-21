import { extractSeoDescription } from './seo-description';

describe(extractSeoDescription.name, () => {
    it('returns visible plain text from the first paragraph', () => {
        expect(
            extractSeoDescription(
                'Use the [`KbqButton`](https://example.com) component with `<button>` elements.\n\n### Next section'
            )
        ).toBe('Use the KbqButton component with button elements.');
    });

    it('returns null when a document has no paragraph', () => {
        expect(extractSeoDescription('### Section')).toBeNull();
    });

    it('decodes each HTML entity only once', () => {
        expect(extractSeoDescription('&amp;quot; &amp;lt; &quot; &lt;')).toBe('&quot; &lt; "');
    });

    it('truncates long descriptions without splitting a word', () => {
        const description = extractSeoDescription('word '.repeat(60));

        expect(description!.length).toBeLessThanOrEqual(200);
        expect(description!.endsWith('…')).toBe(true);
    });
});
