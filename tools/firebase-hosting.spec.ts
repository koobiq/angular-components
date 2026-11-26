import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { globSync } from 'glob';
import { DOCS_DEFAULT_LOCALE, DOCS_SUPPORTED_LOCALES } from '../apps/docs/src/app/constants/locale';
import { docsGetPagePaths } from '../apps/docs/src/app/page-paths';
import { docsGetCategories, docsGetItems, DocsStructureItemId } from '../apps/docs/src/app/structure';
import { findRedirect, findRewrite, readHostingTarget } from './firebase-hosting.mjs';

const next = readHostingTarget('next');
const prerendered = new Set(docsGetPagePaths().map(({ path }) => path));

/** The address the path ends at after every redirect, as a client that runs no JavaScript follows them. */
const follow = (path: string): string => {
    let current = path;

    for (let hops = 0; hops < 5; hops++) {
        const redirect = findRedirect(next, current);

        if (!redirect) return current;

        current = redirect.location;
    }

    throw new Error(`${path} redirects in a loop`);
};

describe('firebase.json', () => {
    it.each(['stable', 'next'])('leaves missing examples and Markdown tabs to the 404 page on %s', (target) => {
        const hosting = readHostingTarget(target);

        for (const path of [
            '/en/components/alert/colors.md',
            '/ru/main/installation/api.md',
            '/examples/definitely-not-an-example',
            '/examples/definitely-not-an-example/nested'
        ]) {
            expect(findRedirect(hosting, path)).toBeNull();
            expect(findRewrite(hosting, path)).toBeNull();
        }
    });

    it('hosts the stable version the way it hosts the next one', () => {
        const stable = readHostingTarget('stable');

        expect(stable.redirects).toEqual(next.redirects);
        expect(stable.rewrites).toEqual(next.rewrites);
    });

    it.each(['stable', 'next'])('publishes the skill index and skill files with CORS on %s', (target) => {
        const hosting = readHostingTarget(target);

        const root = mkdtempSync(join(tmpdir(), 'koobiq-hosting-'));
        const skills = '.well-known/agent-skills';
        const files = [`${skills}/index.json`, `${skills}/koobiq-angular/SKILL.md`];

        try {
            mkdirSync(join(root, skills, 'koobiq-angular'), { recursive: true });
            for (const file of files) writeFileSync(join(root, file), '');

            const published = globSync('**/*', { cwd: root, dot: true, posix: true, ignore: hosting.ignore });

            expect(published).toEqual(
                expect.arrayContaining(['.well-known', skills, `${skills}/koobiq-angular`, ...files])
            );
        } finally {
            rmSync(root, { recursive: true, force: true });
        }

        const rule = hosting.headers.find(({ source }) => source === `/${skills}/**`);

        expect(rule?.headers).toContainEqual({ key: 'Access-Control-Allow-Origin', value: '*' });
    });

    it('redirects no prerendered page but the root, which the redirect would hide', () => {
        // The prerendered root is the redirect of the router, a page with a meta refresh.
        expect([...prerendered].filter((path) => findRedirect(next, path))).toEqual(['/']);
    });

    it('sends the root to the home page of the default locale', () => {
        expect(follow('/')).toBe(`/${DOCS_DEFAULT_LOCALE}`);
        expect(prerendered).toContain(`/${DOCS_DEFAULT_LOCALE}`);
    });

    describe.each(DOCS_SUPPORTED_LOCALES)('in "%s"', (locale) => {
        it('sends the address of every item to its first page, as the router does', () => {
            const missed = docsGetItems().flatMap(({ categoryId, id }) => {
                const path = `/${locale}/${categoryId}/${id}`;
                const firstPage = [...prerendered].find((page) => page === path || page.startsWith(`${path}/`));

                return follow(path) === firstPage ? [] : [`${path} -> ${follow(path)}, not ${firstPage}`];
            });

            expect(missed).toEqual([]);
        });

        it('sends the address of every category to a page of it', () => {
            for (const { id } of docsGetCategories()) {
                const page = follow(`/${locale}/${id}`);

                expect(prerendered).toContain(page);
                expect(page.startsWith(`/${locale}/${id}/`)).toBe(true);
            }
        });

        it('sends the former address of the icons page to the page', () => {
            expect(follow(`/${locale}/${DocsStructureItemId.Icons}`)).toBe(
                `/${locale}/main/${DocsStructureItemId.Icons}`
            );
        });
    });

    it('renders in the browser only the page of a single example, and answers 404 for any other unknown address', () => {
        // The address docsExamplePageUrl builds: its module needs the Angular compiler to load.
        expect(findRewrite(next, '/examples/alert-overview')).toBeNull();
        // A relative link inside an example, such as a breadcrumb, keeps the example page under its own address.
        expect(findRewrite(next, '/examples/breadcrumbs-overview/main/sections')).toBe('/index.csr.html');
        expect(findRewrite(next, '/examples/alert-overview.md')).toBeNull();
        expect(findRewrite(next, '/examples/alert-overview/missing.js')).toBeNull();
        expect(findRewrite(next, '/en/components/alert/unknown')).toBeNull();
        expect(findRewrite(next, '/.well-known/api-catalog')).toBeNull();
    });
});
