import { findMarkdownProblems } from './markdown-problems';

const SERVED = new Set(['en/components/button.md', 'llms-full.txt']);

const problems = (text: string): string[] => findMarkdownProblems(text, SERVED);

describe(findMarkdownProblems.name, () => {
    it('passes plain Markdown with links that lead somewhere', () => {
        expect(
            problems(
                [
                    '# Button',
                    '',
                    '- Page: https://koobiq.io/en/components/button/overview',
                    '',
                    '## Overview',
                    '',
                    'See [the Markdown](https://koobiq.io/en/components/button.md#size), [the index](https://koobiq.io/llms.txt), [tokens](https://koobiq.io/en/main/design-tokens/colors) and [size](#size).',
                    '',
                    '```html',
                    '<button kbq-button>{/* not a comment here */}</button>',
                    '```'
                ].join('\n')
            )
        ).toEqual([]);
    });

    it('reports what only the site would render', () => {
        expect(problems('# Button\n\n<div>Content</div>\n\nSee \\<Example id="button-overview" />.')).toEqual([
            'raw HTML, which only the site renders: <div>Content</div>',
            'a leftover of MDX: See <Example id="button-overview" />.'
        ]);
    });

    it('reports a title that is missing, repeated or not at the top, and a heading that skips a level', () => {
        expect(problems('## Button')).toEqual([
            '"Button", a heading of level 2 right under level 0',
            'expected one title at the very top, found 0'
        ]);
        expect(problems('# Button\n\n# Again')).toEqual(['expected one title at the very top, found 2']);
        expect(problems('# Button\n\n### Size')).toEqual(['"Size", a heading of level 3 right under level 1']);
    });

    it('reports links that lead nowhere outside the site or to nothing on it', () => {
        expect(
            problems(
                [
                    '# Button',
                    '',
                    '[relative](/en/components/button)',
                    '[missing file](https://koobiq.io/en/components/missing.md)',
                    '[missing tab](https://koobiq.io/en/components/alert/examples)',
                    '[guide API](https://koobiq.io/en/main/theming/api)'
                ].join('\n')
            )
        ).toEqual([
            'a relative link, which leads nowhere outside the site: /en/components/button',
            'a link to a file the site does not serve: https://koobiq.io/en/components/missing.md',
            'a link to a page the site does not have: https://koobiq.io/en/components/alert/examples',
            'a link to a page the site does not have: https://koobiq.io/en/main/theming/api'
        ]);
    });
});
