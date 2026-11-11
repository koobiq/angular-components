import { parsePage } from './compile-page';
import { comparePageLocales, findLocaleProblems } from './locale-parity';

const page = (path: string, source: string) => ({ path, root: parsePage(source, path) });

const compare = (en: string, ru: string): string[] =>
    comparePageLocales(page('page.en.mdx', en), page('page.ru.mdx', ru));

describe(comparePageLocales.name, () => {
    it('accepts a translation with the same blocks', () => {
        const en = '# Title\n\nText.\n\n- one\n- two\n\n<Example id="a" />\n\n| a |\n| - |\n| b |\n';
        const ru = '# Заголовок\n\nТекст.\n\n- раз\n- два\n\n<Example id="a" />\n\n| а |\n| - |\n| б |\n';

        expect(compare(en, ru)).toEqual([]);
    });

    it('ignores MDX comments, which the reader never sees', () => {
        expect(compare('Text.\n', '{/* note */}\n\nТекст.\n')).toEqual([]);
    });

    it('reports a paragraph one language does not have, with the lines of both', () => {
        expect(compare('One.\n\nTwo.\n\n### H\n', 'Раз.\n\n### Н\n')).toEqual([
            'page.en.mdx:3 has paragraph, but page.ru.mdx:3 has heading of level 3'
        ]);
    });

    it('reports a language that ends early', () => {
        expect(compare('One.\n', 'Раз.\n\nДва.\n')).toEqual([
            'page.en.mdx has no more blocks, but page.ru.mdx:3 has paragraph'
        ]);
    });

    it('reports a heading of another level', () => {
        expect(compare('### H\n', '#### Н\n')).toEqual([
            'page.en.mdx:1 has heading of level 3, but page.ru.mdx:1 has heading of level 4'
        ]);
    });

    it('reports another example and another image', () => {
        expect(compare('<Example id="a" />\n', '<Example id="b" />\n')).toEqual([
            'page.en.mdx:1 has example a, but page.ru.mdx:1 has example b'
        ]);
        expect(compare('![a](./a.png)\n', '![а](./b.png)\n')).toEqual([
            'page.en.mdx:1 has paragraph with image ./a.png, but page.ru.mdx:1 has paragraph with image ./b.png'
        ]);
    });

    it('reports an image in HTML one language does not have', () => {
        expect(compare('Text.\n', 'Текст.\n\n<div>\n    <img src="./a.jpg" alt="" />\n</div>\n')).toEqual([
            'page.en.mdx has no more blocks, but page.ru.mdx:3 has <div>'
        ]);
        expect(compare('<img src="./a.jpg" alt="" />\n', '<img src="./b.jpg" alt="" />\n')).toEqual([
            'page.en.mdx:1 has <img> ./a.jpg, but page.ru.mdx:1 has <img> ./b.jpg'
        ]);
    });

    it('reports another image inside a paragraph, however it is written', () => {
        expect(compare('Text <img src="./a.png" alt="" />.\n', 'Текст <img src="./b.png" alt="" />.\n')).toEqual([
            'page.en.mdx:1 has paragraph with image ./a.png, but page.ru.mdx:1 has paragraph with image ./b.png'
        ]);
        expect(compare('[![a](./a.png)](/en/a)\n', '[![а](./b.png)](/ru/a)\n')).toEqual([
            'page.en.mdx:1 has paragraph with image ./a.png, but page.ru.mdx:1 has paragraph with image ./b.png'
        ]);
    });

    it('reports lists and tables of another size, nested lists included', () => {
        expect(compare('- one\n- two\n', '- раз\n')).toEqual([
            'page.en.mdx:1 has bulleted list, items: 2, but page.ru.mdx:1 has bulleted list, items: 1'
        ]);
        expect(compare('- one\n  - nested\n', '- раз\n')).toEqual([
            'page.en.mdx:2 has bulleted list, items: 1, but page.ru.mdx has no more blocks'
        ]);
        expect(compare('| a |\n| - |\n| b |\n', '| а |\n| - |\n')).toEqual([
            'page.en.mdx:1 has table, rows: 2, columns: 1, but page.ru.mdx:1 has table, rows: 1, columns: 1'
        ]);
    });

    it('reports a code block in another language, but not its text', () => {
        expect(compare('```ts\n// note\n```\n', '```ts\n// заметка\n```\n')).toEqual([]);
        expect(compare('```ts\n```\n', '```html\n```\n')).toEqual([
            'page.en.mdx:1 has ts code block, but page.ru.mdx:1 has html code block'
        ]);
    });

    it('leaves alone a link to another site, whatever its path says', () => {
        expect(compare('[a](https://example.com/ru/a)\n', '[а](https://docs.github.com/en/a)\n')).toEqual([]);
    });

    it('reports a link to the other language written as an <a> element', () => {
        expect(compare('Text.\n', 'Текст <a href="/en/components/a">ссылка</a>.\n')).toEqual([
            'page.ru.mdx:1: links to the other language: /en/components/a'
        ]);
    });

    it('reports a link to the other language, in any of the forms the pages use', () => {
        expect(compare('[a](/ru/components/a)\n', '[а](/ru/components/a)\n')).toEqual([
            'page.en.mdx:1: links to the other language: /ru/components/a'
        ]);
        expect(compare('[a](/en/components/a)\n', '[а](en/components/a)\n')).toEqual([
            'page.ru.mdx:1: links to the other language: en/components/a'
        ]);
        expect(compare('[a](https://koobiq.io/en/a)\n', '[а](https://koobiq.io/en/a)\n')).toEqual([
            'page.ru.mdx:1: links to the other language: https://koobiq.io/en/a'
        ]);
    });
});

describe(findLocaleProblems.name, () => {
    const pages: Record<string, string> = {
        'a.en.mdx': 'One.\n',
        'a.ru.mdx': 'Раз.\n\nДва.\n',
        'b.en.mdx': 'One.\n',
        'c.ru.mdx': 'Раз.\n',
        'd.en.mdx': 'One.\n',
        'd.ru.mdx': 'Раз.\n'
    };

    it('reports a page without its other language and a pair that differs', () => {
        expect(findLocaleProblems(Object.entries(pages).map(([path, source]) => page(path, source)))).toEqual([
            'b.en.mdx: no b.ru.mdx next to it',
            'c.ru.mdx: no c.en.mdx next to it',
            'a.en.mdx has no more blocks, but a.ru.mdx:3 has paragraph'
        ]);
    });
});
