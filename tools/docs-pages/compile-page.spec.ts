import { parseTemplate, TmplAstElement, TmplAstNode, TmplAstText } from '@angular/compiler';
import type { LiveExample } from '../../packages/docs-examples/example-module';
import { compilePage } from './compile-page';

const example = (componentName: string, importPath = 'components/alert') =>
    ({ componentName, importPath }) as LiveExample;

const EXAMPLES: Record<string, LiveExample> = {
    'alert-overview': example('AlertOverviewExample'),
    'alert-status': example('AlertStatusExample'),
    'ag-grid-overview': example('AgGridOverviewExample', 'components/ag-grid')
};

const LINK_CLASS = 'kbq-markdown__a docs-markdown__a kbq-link kbq-text-only kbq-link_use-visited';

const compile = (source: string, url: string | null = '/en/components/alert/overview') =>
    compilePage(source, { path: 'alert.en.mdx', examples: EXAMPLES, url });

/** Text of the template as Angular reads it; throws on anything that is not a static element or text. */
const readStaticText = (nodes: TmplAstNode[]): string =>
    nodes
        .map((node) => {
            if (node instanceof TmplAstText) return node.value;
            if (node instanceof TmplAstElement) return readStaticText(node.children);

            throw new Error(`Angular parsed ${node.constructor.name} out of the page text`);
        })
        .join('');

describe(compilePage.name, () => {
    it('renders Markdown with the classes of the documentation typography', () => {
        expect(compile('An intro with **bold**, _stress_ and `code`.').template).toBe(
            '<p class="kbq-markdown__p">An intro with <strong>bold</strong>, <em>stress</em> and <code class="kbq-markdown__code">code</code>.</p>'
        );
    });

    it('gives the linked heading levels an id derived from their text', () => {
        expect(compile('# Alert\n\n### Size\n\n#### Размер шрифта').template).toBe(
            [
                '<h1 class="docs-header-link kbq-markdown__h1">Alert</h1>',
                '<h3 id="size" class="docs-header-link kbq-markdown__h3">Size</h3>',
                '<h4 id="размер-шрифта" class="docs-header-link kbq-markdown__h4">Размер шрифта</h4>'
            ].join('\n')
        );
    });

    it('leaves the comments of a heading out of its id', () => {
        expect(compile('### Size {/* cspell:ignore sz */}').template).toBe(
            '<h3 id="size" class="docs-header-link kbq-markdown__h3">Size </h3>'
        );
    });

    // Text nested under a heading of the page, compiled piece by piece, would repeat its ids.
    it('renders every heading at the given depth without an anchor', () => {
        expect(
            compilePage('## Usage\n\n### Usage', { path: 'KbqAlert', examples: {}, url: null, headingDepth: 4 })
                .template
        ).toBe(['<h4 class="kbq-markdown__h4">Usage</h4>', '<h4 class="kbq-markdown__h4">Usage</h4>'].join('\n'));
    });

    // Angular drops a text node of whitespace alone, which would join the words around it.
    it('keeps the space between inline elements', () => {
        const { nodes, errors } = parseTemplate(compile('`disabled` _and_ `aria-disabled`').template, 'page.html');

        expect(errors).toBeNull();
        expect(readStaticText(nodes)).toBe('disabled and aria-disabled');
    });

    // Unescaped, Angular parsed `{{ value }}` into a binding and `@for` into a real loop.
    it('keeps interpolations, control flow blocks and markup in the text as text', () => {
        const text = '{{ value }}, @for (item of items; track item) {} and <span class="x">';
        const { template } = compile(`\`${text}\``);
        const { nodes, errors } = parseTemplate(template, 'alert.en.page.html');

        expect(errors).toBeNull();
        expect(readStaticText(nodes)).toBe(text);
    });

    it('renders the items of a tight list without paragraphs', () => {
        expect(compile('- one\n- two').template).toBe(
            '<ul class="kbq-markdown__ul"><li class="kbq-markdown__li">one</li><li class="kbq-markdown__li">two</li></ul>'
        );
    });

    it('keeps the paragraphs of a loose list', () => {
        expect(compile('3. one\n\n4. two').template).toBe(
            '<ol start="3" class="kbq-markdown__ol">' +
                '<li class="kbq-markdown__li"><p class="kbq-markdown__p">one</p></li>' +
                '<li class="kbq-markdown__li"><p class="kbq-markdown__p">two</p></li>' +
                '</ol>'
        );
    });

    it('renders tables with the alignment of their columns', () => {
        expect(compile('| Key | Action |\n| :-: | --- |\n| Esc | Close |').template).toBe(
            '<table class="kbq-markdown__table"><thead class="kbq-markdown__thead"><tr class="kbq-markdown__tr">' +
                '<th class="kbq-markdown__th" align="center">Key</th><th class="kbq-markdown__th">Action</th>' +
                '</tr></thead><tbody class="kbq-markdown__tbody"><tr class="kbq-markdown__tr">' +
                '<td class="kbq-markdown__td" align="center">Esc</td><td class="kbq-markdown__td">Close</td>' +
                '</tr></tbody></table>'
        );
    });

    it('renders quotes, rules and hard line breaks', () => {
        expect(compile('> Quoted  \nline\n\n---').template).toBe(
            '<blockquote class="kbq-markdown__blockquote"><p class="kbq-markdown__p">Quoted<br>line</p></blockquote>\n' +
                '<hr class="kbq-markdown__hr">'
        );
    });

    it('sets the text after an image in italics, as its caption', () => {
        expect(compile('![Button states](./assets/button.png)\nBasic states').template).toBe(
            '<p class="kbq-markdown__p"><img class="kbq-markdown__img" src="./assets/button.png" alt="Button states">' +
                '<em>\nBasic states</em></p>'
        );
    });

    // With a base href of `/`, a bare `#size` would lead to the start page.
    it('resolves links to a fragment of the page against its URL', () => {
        expect(compile('[Size](#size), [button](/en/components/button/overview)').template).toBe(
            `<p class="kbq-markdown__p"><a class="${LINK_CLASS}" href="/en/components/alert/overview#size">Size</a>, ` +
                `<a class="${LINK_CLASS}" href="/en/components/button/overview">button</a></p>`
        );
        expect(compile('[Size](#size)', null).template).toContain('href="#size"');
    });

    // GFM turns the URL in the text into a link of its own, which would nest one link in another.
    it('renders a URL inside a link as text', () => {
        expect(compile('See <a href="https://koobiq.io">www.koobiq.io</a>.').template).toBe(
            `<p class="kbq-markdown__p">See <a class="${LINK_CLASS}" href="https://koobiq.io">www.koobiq.io</a>.</p>`
        );
    });

    it('renders HTML with the classes of the documentation typography', () => {
        expect(compile('Press <kbd>Esc</kbd> or <a href="#close" target="_self">close</a>.').template).toBe(
            `<p class="kbq-markdown__p">Press <kbd>Esc</kbd> or <a class="${LINK_CLASS}" href="/en/components/alert/overview#close" target="_self">close</a>.</p>`
        );
        expect(compile('<ul class="tokens">\n<li>alert</li>\n</ul>').template).toBe(
            '<ul class="kbq-markdown__ul tokens"><li class="kbq-markdown__li">alert</li></ul>'
        );
    });

    // An HTML block runs until a blank line in Markdown, so only what follows a blank line is a paragraph.
    it('keeps a paragraph inside HTML only after a blank line', () => {
        expect(
            compile(
                '<div class="callout">\n<div class="header">Note</div>\n<div class="content">\n\nRequired.\n\n</div>\n</div>'
            ).template
        ).toBe(
            '<div class="callout"><div class="header">Note</div><div class="content"><p class="kbq-markdown__p">Required.</p></div></div>'
        );
        expect(
            compile(
                '<details>\n    <summary>Tokens</summary>\n    <a href="https://koobiq.io">\n        alert\n    </a>\n</details>'
            ).template
        ).toBe(
            `<details><summary>Tokens</summary><a class="${LINK_CLASS}" href="https://koobiq.io">alert</a></details>`
        );
    });

    it('skips comments, which are meant for the tools', () => {
        expect(
            compile('{/* cspell:ignore arrowless */}\n\nThe arrowless popover {/* prettier-ignore */}.').template
        ).toBe('\n<p class="kbq-markdown__p">The arrowless popover .</p>');
    });

    // The migration guide wraps its steps in sections, and reads its tool comments to tag them.
    it('lets a page lay its top-level blocks out, comments included', () => {
        const page = compilePage('{/* first */}\n\n### Size\n\nText', {
            path: 'alert.en.mdx',
            examples: EXAMPLES,
            url: null,
            layout: (blocks) =>
                blocks.map(({ node, template }) => `<div title="${node.type}">${template}</div>`).join('')
        });

        expect(page.template).toBe(
            '<div title="mdxFlowExpression"></div>' +
                '<div title="heading"><h3 id="size" class="docs-header-link kbq-markdown__h3">Size</h3></div>' +
                '<div title="paragraph"><p class="kbq-markdown__p">Text</p></div>'
        );
    });

    it('binds fenced code from the component rather than writing it into the template', () => {
        const page = compile('```html\n<p>{{ value }}</p>\n```\n\n```\nplain\n```');

        expect(page.template).toBe(
            [
                '<kbq-code-block class="docs-code-block" filled [files]="[codeBlocks[0]]" />',
                '<kbq-code-block class="docs-code-block" filled [files]="[codeBlocks[1]]" />'
            ].join('\n')
        );
        expect(page.codeBlocks).toEqual([
            { content: '<p>{{ value }}</p>', language: 'html' },
            { content: 'plain', language: 'plaintext' }
        ]);
    });

    it('renders an example with its class and lists every example once', () => {
        const page = compile(
            '<Example id="alert-status" />\n\n<Example id="alert-overview" />\n\n<Example id="alert-status" />'
        );

        expect(page.template).toBe(
            [
                '<docs-live-example-viewer example="alert-status" [component]="examples.AlertStatusExample" />',
                '<docs-live-example-viewer example="alert-overview" [component]="examples.AlertOverviewExample" />',
                '<docs-live-example-viewer example="alert-status" [component]="examples.AlertStatusExample" />'
            ].join('\n')
        );
        expect(page.examples).toEqual([EXAMPLES['alert-status'], EXAMPLES['alert-overview']]);
        expect(page.browserExamples).toEqual([]);
    });

    it('lists an example that cannot render on the server apart, for the page to load it in the browser', () => {
        const page = compile('<Example id="ag-grid-overview" />');

        expect(page.template).toBe(
            '<docs-live-example-viewer example="ag-grid-overview" [component]="examples.AgGridOverviewExample" />'
        );
        expect(page.examples).toEqual([]);
        expect(page.browserExamples).toEqual([EXAMPLES['ag-grid-overview']]);
    });

    it('reports the position of what it cannot compile', () => {
        expect(() => compile('Intro.\n\n  <Example id="alert-missing" />')).toThrow(
            'alert.en.mdx:3:3: there is no example "alert-missing" in packages/docs-examples'
        );
    });

    it('reports the position of a syntax error', () => {
        expect(() => compile('Intro.\n\n<!-- a comment -->')).toThrow('alert.en.mdx:3:2: Unexpected character `!`');
    });

    it.each([
        ['an example without an id', '<Example />', '<Example> takes a single string attribute: id'],
        [
            'an example with other attributes',
            '<Example id="alert-status" open />',
            '<Example> takes a single string attribute: id'
        ],
        [
            'an example with content',
            '<Example id="alert-status">\n  Text\n</Example>',
            '<Example> does not take content'
        ],
        ['an example inside text', 'See <Example id="alert-status" />', '<Example> has to stand on a line of its own'],
        ['an unknown component', '<Callout />', 'unknown component <Callout>'],
        ['an element Angular does not know', 'Keep <nobr>together</nobr>', '<nobr> is not supported'],
        ['a block element inside a paragraph', 'Text <div>block</div>', '<div> cannot be inside a paragraph'],
        [
            'an example inside <p>',
            '<p>\n<Example id="alert-status" />\n</p>',
            '<Example> cannot be inside a paragraph'
        ],
        ['a list inside <p>', '<p>\n\n- item\n\n</p>', '"list" cannot be inside a paragraph'],
        ['a link inside a link', '[<a href="/a">a</a>](/b)', '<a> cannot be inside a link'],
        [
            'an attribute with an expression',
            '<span class={name}>x</span>',
            'the attributes of <span> must be plain strings'
        ],
        ['an attribute Angular would interpolate', '<span title="{{ x }}">x</span>', 'cannot contain "{{" or "}}"'],
        ['an import', "import { Callout } from './callout';", 'imports, exports and {expressions} are not supported'],
        ['an expression', '{1 + 1}', 'imports, exports and {expressions} are not supported'],
        ['a task list', '- [x] done', 'task lists are not supported yet'],
        ['Markdown the site does not render yet', '[^1]: A footnote', '"footnoteDefinition" is not supported yet']
    ])('fails on %s', (_name, source, message) => {
        expect(() => compile(source)).toThrow(message);
    });
});
