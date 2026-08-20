import { readFileSync } from 'fs';
import { join } from 'path';
import { DOCS_SUPPORTED_LOCALES } from './constants/locale';
import { docsGetIndexablePagePaths } from './page-paths';

describe(docsGetIndexablePagePaths.name, () => {
    it('contains welcome, overview, API, examples and icons pages without duplicates', () => {
        const paths = docsGetIndexablePagePaths();

        expect(paths).toContain('');
        expect(paths).toContain('components/alert/overview');
        expect(paths).toContain('components/alert/api');
        expect(paths).toContain('components/select/examples');
        expect(paths).toContain('icons');
        expect(new Set(paths).size).toBe(paths.length);
    });

    it('stays synchronized with the committed prerender route registry', () => {
        const expectedRoutes = DOCS_SUPPORTED_LOCALES.flatMap((locale) =>
            docsGetIndexablePagePaths().map((path) => `/${locale}${path ? `/${path}` : ''}`)
        );
        const prerenderRoutes = readFileSync(join(process.cwd(), 'apps/docs/src/prerender-routes.txt'), 'utf8')
            .trim()
            .split('\n');

        expect(prerenderRoutes).toEqual(expectedRoutes);
    });

    it('stays synchronized with the committed sitemap', () => {
        const expectedUrls = docsGetIndexablePagePaths().flatMap((path) =>
            DOCS_SUPPORTED_LOCALES.map((locale) => `https://koobiq.io/${locale}${path ? `/${path}` : ''}`)
        );
        const sitemap = readFileSync(join(process.cwd(), 'apps/docs/src/sitemap.xml'), 'utf8');
        const sitemapUrls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g), ([, url]) => url);

        expect(sitemapUrls).toEqual(expectedUrls);
    });
});
