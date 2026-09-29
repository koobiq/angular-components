import { exampleAsMarkdown } from './example-markdown';

describe('exampleAsMarkdown', () => {
    it('fences an example that is bare source code', () => {
        expect(exampleAsMarkdown("getFormattedSizeParts(1500, 'SI');")).toBe(
            "```typescript\ngetFormattedSizeParts(1500, 'SI');\n```"
        );
    });

    // A backtick alone does not make it Markdown: a template literal is source code too.
    it('fences source code with backticks in it', () => {
        expect(exampleAsMarkdown('const width = `${size}px`;')).toBe('```typescript\nconst width = `${size}px`;\n```');
    });

    it('leaves an example that has a fence of its own as it is', () => {
        expect(exampleAsMarkdown('```html\n<kbq-splitter />\n```')).toBe('```html\n<kbq-splitter />\n```');
        expect(exampleAsMarkdown('Two panels:\n~~~html\n<kbq-splitter />\n~~~')).toBe(
            'Two panels:\n~~~html\n<kbq-splitter />\n~~~'
        );
    });
});
