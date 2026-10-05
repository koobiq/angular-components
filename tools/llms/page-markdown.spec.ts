import { LlmsExample, pageSummary, pageToMarkdown } from './page-markdown';

const EXAMPLES: Record<string, LlmsExample> = {
    'alert-overview': {
        id: 'alert-overview',
        title: 'Alert overview',
        files: [
            {
                name: 'alert-overview-example.ts',
                content: "@Component({ templateUrl: 'alert-overview-example.html' })\n"
            },
            { name: 'alert-overview-example.html', content: '<kbq-alert>Text</kbq-alert>\n' }
        ]
    }
};

const resolveExample = (id: string): LlmsExample => {
    if (!EXAMPLES[id]) throw new Error(`Unknown example "${id}"`);

    return EXAMPLES[id];
};

const resolveUrl = (url: string): string => (url.startsWith('/') ? `https://koobiq.io${url}.md` : url);

const convert = (source: string, headingDepth = 2): string =>
    pageToMarkdown(source, { path: 'alert.en.mdx', headingDepth, resolveExample, resolveUrl });

describe(pageToMarkdown.name, () => {
    it('replaces a live example with the source of every file it has', () => {
        expect(convert('Intro.\n\n<Example id="alert-overview" />')).toBe(
            [
                'Intro.',
                '',
                '**Example: Alert overview** (`alert-overview`)',
                '',
                '```ts alert-overview-example.ts',
                "@Component({ templateUrl: 'alert-overview-example.html' })",
                '```',
                '',
                '```html alert-overview-example.html',
                '<kbq-alert>Text</kbq-alert>',
                '```'
            ].join('\n')
        );
    });

    it('fails on an example the catalogue does not have', () => {
        expect(() => convert('<Example id="missing" />')).toThrow('Unknown example "missing"');
    });

    it('drops what only the site shows: comments, images and the HTML wrappers around text', () => {
        expect(
            convert(
                [
                    '{/* prettier-ignore */}',
                    '![States](./assets/states.png)',
                    '',
                    '<div class="note">Press <kbd>Enter</kbd>, then <strong>Save</strong>.<br />Done.</div>',
                    '',
                    '<img src="./assets/states.png" />'
                ].join('\n')
            )
        ).toBe('Press `Enter`, then **Save**.\\\nDone.');
    });

    it('leads links within the site to where a reader outside it can open them', () => {
        expect(convert('See [select](/en/components/select) and <a href="/en/main/theming">theming</a>.')).toBe(
            'See [select](https://koobiq.io/en/components/select.md) and [theming](https://koobiq.io/en/main/theming.md).'
        );
    });

    it('keeps the address of a link around nothing but an image', () => {
        expect(convert('[![npm](./badge.svg)](https://www.npmjs.com/package/@koobiq/components)')).toBe(
            '<https://www.npmjs.com/package/@koobiq/components>'
        );
    });

    it('moves the headings to the given depth, keeping the distances between them', () => {
        expect(convert('### Size\n\n#### Compact\n\n### Color', 3)).toBe('### Size\n\n#### Compact\n\n### Color');
        expect(convert('### Size\n\n#### Compact\n\n### Color', 2)).toBe('## Size\n\n### Compact\n\n## Color');
    });

    it('keeps tables and the code of the page as they are', () => {
        expect(convert('| a | b |\n| - | - |\n| 1 | 2 |\n\n```html\n<b>{{ a }}</b>\n```')).toBe(
            '| a | b |\n| - | - |\n| 1 | 2 |\n\n```html\n<b>{{ a }}</b>\n```'
        );
    });
});

describe(pageSummary.name, () => {
    const summarize = (source: string): string | null =>
        pageSummary(source, { path: 'alert.en.mdx', resolveExample, resolveUrl });

    it('takes the first sentence of the introduction, with its Markdown', () => {
        expect(summarize('`kbq-alert` shows a message. It has sizes.\n\n### Size\n\nText.')).toBe(
            '`kbq-alert` shows a message.'
        );
    });

    it('does not end the sentence at an abbreviation', () => {
        expect(summarize('Formatters, e.g. the date formatter, turn values into text. They follow the locale.')).toBe(
            'Formatters, e.g. the date formatter, turn values into text.'
        );
    });

    it('reads past a live example and a heading of the page title level', () => {
        expect(summarize('## Upgrade\n\n<Example id="alert-overview" />\n\nSteps to take.\n\n### Plan')).toBe(
            'Steps to take.'
        );
    });

    it('returns null for a page without an introduction', () => {
        expect(summarize('### Size\n\nText.')).toBeNull();
    });
});
