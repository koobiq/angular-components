import { parseTemplate } from '@angular/compiler';
import { renderCodeBlock } from './code-block';
import { exampleAsMarkdown } from './transforms/example-markdown';

describe('renderCodeBlock', () => {
    it('binds the file inline, escaped for a string literal inside an attribute', () => {
        expect(renderCodeBlock(`type Mode = "full" | 'short' & Base;\nconst a = 1;`, { language: 'typescript' })).toBe(
            `<kbq-code-block class="docs-code-block" filled [files]="[{content: 'type Mode = &quot;full&quot; | \\u0027short\\u0027 &amp; Base;\\nconst a = 1;', language: 'typescript'}]" />`
        );
    });

    // Angular finds a `//` comment by counting quotes, escaped ones included.
    it('keeps a quoted URL from ending the binding early', () => {
        const { errors } = parseTemplate(
            renderCodeBlock("const url = 'https://koobiq.io';", { language: 'typescript' }),
            'api.html'
        );

        expect(errors).toBeNull();
    });

    it('adds a class and line numbers', () => {
        expect(
            renderCodeBlock('[0, 1]', { language: 'plaintext', extraClass: 'docs-api__import', lineNumbers: true })
        ).toBe(
            `<kbq-code-block class="docs-code-block docs-api__import" filled lineNumbers [files]="[{content: '[0, 1]', language: 'plaintext'}]" />`
        );
    });
});

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
