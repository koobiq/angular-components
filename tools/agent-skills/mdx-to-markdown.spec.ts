import { pageToMarkdown, ResolvedExample } from './mdx-to-markdown';

const EXAMPLES: Record<string, ResolvedExample> = {
    'alert-overview': {
        id: 'alert-overview',
        title: 'Alert overview',
        files: [
            {
                name: 'alert-overview-example.ts',
                content: "import { KbqAlertModule } from '@koobiq/components/alert';\n"
            },
            { name: 'alert-overview-example.html', content: '<kbq-alert>Text</kbq-alert>\n' }
        ]
    }
};

const convert = (source: string): string =>
    pageToMarkdown(source, {
        path: 'alert.en.mdx',
        siteUrl: 'https://koobiq.io',
        resolveExample: (id) => {
            if (!EXAMPLES[id]) throw new Error(`Unknown example "${id}"`);

            return EXAMPLES[id];
        }
    });

describe(pageToMarkdown.name, () => {
    it('should replace a live example with its title and the code of every file', () => {
        const markdown = convert('An alert.\n\n<Example id="alert-overview" />\n');

        expect(markdown).toContain('**Example: Alert overview** (`alert-overview`)');
        expect(markdown).toContain(
            "```ts alert-overview-example.ts\nimport { KbqAlertModule } from '@koobiq/components/alert';\n```"
        );
        expect(markdown).toContain('```html alert-overview-example.html\n<kbq-alert>Text</kbq-alert>\n```');
        expect(markdown).not.toContain('<Example');
    });

    it('should fail on an unknown example, like the documentation build', () => {
        expect(() => convert('<Example id="missing" />\n')).toThrow('Unknown example "missing"');
    });

    it('should drop MDX comments and images', () => {
        const markdown = convert('{/* for editors */}\n\nText.\n\n![Alert states](./assets/states.png)\n');

        expect(markdown).toBe('Text.');
    });

    it('should make site-relative links absolute and keep external ones', () => {
        const markdown = convert(
            'See [theming](/en/main/theming/overview) and [MDN](https://developer.mozilla.org).\n'
        );

        expect(markdown).toContain('[theming](https://koobiq.io/en/main/theming/overview)');
        expect(markdown).toContain('[MDN](https://developer.mozilla.org)');
    });

    it('should keep the text of HTML elements and turn a line break into a Markdown break', () => {
        const markdown = convert('<div>First line<br />second line</div>\n');

        expect(markdown).toMatch(/^First line\\\nsecond line$/);
    });

    it('should keep tables and fenced code as they are', () => {
        const markdown = convert(
            '| Input | Type |\n| --- | --- |\n| `compact` | `boolean` |\n\n```html\n<kbq-badge></kbq-badge>\n```\n'
        );

        expect(markdown).toContain('| `compact` | `boolean` |');
        expect(markdown).toContain('```html\n<kbq-badge></kbq-badge>\n```');
    });
});
