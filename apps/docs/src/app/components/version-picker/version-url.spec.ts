import { docsGetVersionPageUrl, docsParseSitemapPaths } from './version-url';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url><loc>https://koobiq.io</loc></url>
	<url><loc>https://koobiq.io/en/main/design-tokens/colors</loc></url>
	<url><loc>https://koobiq.io/en/main/design-tokens/typography</loc></url>
	<url><loc>https://koobiq.io/en/components/button/overview</loc></url>
	<url><loc>https://koobiq.io/en/components/button/api</loc></url>
	<url>
		<loc>https://koobiq.io/en/icons/</loc>
	</url>
	<url><loc>https://koobiq.io/ru/components/button/overview</loc></url>
</urlset>`;

const location = (url: string): Pick<Location, 'pathname' | 'search' | 'hash'> =>
    new URL(url, 'https://next.koobiq.io');

describe(docsParseSitemapPaths.name, () => {
    it('reads the path of every page, whatever host and trailing slash the sitemap gives it', () => {
        expect(docsParseSitemapPaths(SITEMAP)).toEqual(
            new Set([
                '/',
                '/en/main/design-tokens/colors',
                '/en/main/design-tokens/typography',
                '/en/components/button/overview',
                '/en/components/button/api',
                '/en/icons',
                '/ru/components/button/overview'
            ])
        );
    });
});

describe(docsGetVersionPageUrl.name, () => {
    const pagePaths = docsParseSitemapPaths(SITEMAP);

    it.each([
        [
            'the same page with its query and anchor',
            '/en/components/button/api?tab=1#inputs',
            '/en/components/button/api?tab=1#inputs'
        ],
        ['the same page without its trailing slash', '/en/icons/', '/en/icons'],
        [
            'the overview of an item that lacks the tab',
            '/en/components/button/examples#top',
            '/en/components/button/overview'
        ],
        ['the overview of an item opened without a tab', '/en/components/button', '/en/components/button/overview'],
        ['the first tab of the design tokens', '/en/main/design-tokens/semantic', '/en/main/design-tokens/colors'],
        ['the home page of the locale for an item the version lacks', '/en/components/flag/overview', '/en'],
        ['the home page of a locale the sitemap leaves out', '/ru', '/ru'],
        ['the root for a page outside every locale', '/examples/button-overview', '/'],
        ['the root for the 404 page', '/404', '/']
    ])('opens %s', (_name, from, to) => {
        expect(docsGetVersionPageUrl(location(from), 'https://koobiq.io/', pagePaths)).toBe(`https://koobiq.io${to}`);
    });

    it('opens the root of a version whose pages it does not know', () => {
        expect(docsGetVersionPageUrl(location('/en/components/button/api'), 'https://v19.koobiq.io/', null)).toBe(
            'https://v19.koobiq.io/'
        );
    });

    it('builds the address on a version URL without a trailing slash', () => {
        expect(docsGetVersionPageUrl(location('/en/components/button/api'), 'https://next.koobiq.io', pagePaths)).toBe(
            'https://next.koobiq.io/en/components/button/api'
        );
    });
});
