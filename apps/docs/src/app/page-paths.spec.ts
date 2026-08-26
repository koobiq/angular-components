import { readFileSync } from 'fs';
import { join } from 'path';
import { docsGetPagePaths } from './page-paths';

describe(docsGetPagePaths.name, () => {
    it('contains localized content and the non-indexable error page without duplicates', () => {
        const pages = docsGetPagePaths();
        const paths = pages.map(({ path }) => path);

        expect(paths).toContain('/en');
        expect(paths).toContain('/ru/components/alert/overview');
        expect(paths).toContain('/en/components/alert/api');
        expect(paths).toContain('/ru/components/select/examples');
        expect(paths).toContain('/en/icons');
        expect(paths).not.toContain('/examples/popover');
        expect(paths).not.toContain('/examples/select');
        expect(pages).toContainEqual({ path: '/', indexable: false });
        expect(pages).toContainEqual({ path: '/404', indexable: false });
        expect(new Set(paths).size).toBe(paths.length);
    });

    it('stays synchronized with the committed prerender registry; run docs:generate-prerender-routes to update', () => {
        const expectedRoutes = docsGetPagePaths().map(({ path }) => path);
        const prerenderRoutes = readFileSync(join(__dirname, '../prerender-routes.txt'), 'utf8').trim().split(/\r?\n/);

        expect(prerenderRoutes).toEqual(expectedRoutes);
    });

    it('stays synchronized with the committed sitemap; run docs:generate-sitemap to update', () => {
        const expectedUrls = docsGetPagePaths()
            .filter(({ indexable }) => indexable)
            .map(({ path }) => `https://koobiq.io${path}`);
        const sitemap = readFileSync(join(__dirname, '../sitemap.xml'), 'utf8');
        const sitemapUrls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g), ([, url]) => url);

        expect(sitemapUrls).toEqual(expectedUrls);
    });
});
