import { compilePage, parsePage } from './compile-page';
import { findBrokenAnchors } from './page-links';

const page = (path: string, url: string | null, source: string) => ({ path, url, root: parsePage(source, path) });

const OTHER = page('other.en.mdx', '/en/components/other/overview', '### Size\n\n### Size\n\n# Title\n\n###### Deep\n');
const OTHER_EXAMPLES = page('examples.other.en.mdx', '/en/components/other/examples', '### Smart search\n');

const SITE_PATHS = new Set(['/en/components/other/api', '/en/main/icons']);

const check = (source: string): string[] =>
    findBrokenAnchors([page('page.en.mdx', '/en/components/page/overview', source), OTHER, OTHER_EXAMPLES], SITE_PATHS);

describe(findBrokenAnchors.name, () => {
    it('accepts a link to a heading of the page itself', () => {
        expect(check('### Global options\n\nSee [options](#global-options).\n')).toEqual([]);
    });

    it('reports a link to a heading the page does not have', () => {
        expect(check('### Options\n\nSee [options](#global-options).\n')).toEqual([
            'page.en.mdx:3: no heading for the link #global-options'
        ]);
    });

    it('accepts every form of a link to another page', () => {
        const links = [
            '/en/components/other/overview#size',
            'en/components/other/overview#size',
            'https://koobiq.io/en/components/other/overview#size',
            '/en/components/other#size',
            '/en/components/other/examples#smart-search'
        ];

        expect(check(links.map((url) => `[link](${url})`).join('\n\n'))).toEqual([]);
    });

    it('reports a heading that another tab of the item has', () => {
        expect(check('[link](/en/components/other/examples#size)\n')).toEqual([
            'page.en.mdx:1: no heading for the link /en/components/other/examples#size'
        ]);
    });

    it('reports a link to a page that does not exist', () => {
        expect(check('[link](/en/components/missing/overview#size)\n')).toEqual([
            'page.en.mdx:1: no page for the link /en/components/missing/overview#size'
        ]);
    });

    it('checks an <a> element, with its fragment percent-encoded', () => {
        const encoded = encodeURIComponent('размер');

        expect(check(`### Размер\n\n<a target="_self" href="#${encoded}">link</a>\n`)).toEqual([]);
        expect(check(`### Другой\n\nText <a href="#${encoded}">link</a>.\n`)).toEqual([
            `page.en.mdx:3: no heading for the link #${encoded}`
        ]);
    });

    it('reports a fragment that is not valid percent-encoding instead of throwing', () => {
        expect(check('### Size\n\n[link](#100%-width)\n')).toEqual([
            'page.en.mdx:3: no heading for the link #100%-width'
        ]);
    });

    it('accepts a heading whose id holds a percent sign', () => {
        expect(check('### 100% width\n\n[link](#100%-width)\n')).toEqual([]);
    });

    it('leaves alone what no MDX page renders, the files for agents and other sites', () => {
        const links = [
            '/en/components/other/api#size',
            '/en/main/icons#size',
            '/en/components/other.md#size',
            'https://example.com/en/a#b'
        ];

        expect(check(links.map((url) => `[link](${url})`).join('\n\n'))).toEqual([]);
    });

    it('knows the same ids the compiler renders', () => {
        const source = '# Title\n\n### Size\n\n### Size\n\n<div>\n\n#### Inside\n\n</div>\n\n###### Deep\n';
        const { template } = compilePage(source, { path: 'page.en.mdx', examples: {}, url: null });
        const rendered = [...template.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id);

        expect(rendered).toEqual(['size', 'size-2', 'inside']);

        const links = rendered.map((id) => `[link](#${id})`).join('\n\n');

        expect(check(`${source}\n${links}\n`)).toEqual([]);
        expect(check(`${source}\n[link](#title)\n\n[link](#deep)\n`)).toHaveLength(2);
    });
});
