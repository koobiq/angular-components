import { readFileSync } from 'fs';
import { parseDocument } from 'yaml';
import { KOOBIQ_SITE_ORIGIN, parseOrigin } from './docs-site-origin';
import {
    renderRobotsTxt,
    renderSitemap,
    renderSiteOrigin,
    ROBOTS_TXT_PATH,
    SITE_ORIGIN_PATH,
    SITEMAP_PATH
} from './generate-sitemap';

const EXPECTED_ALGOLIA_VERIFICATION = '# Algolia-Crawler-Verif: 3871AA90F374600A';
const NEXT_ORIGIN = 'https://next.koobiq.io';

/** A committed file as the generator writes it: a checkout with Windows line endings holds the same file. */
const readCommitted = (path: string): string => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

describe('generate-sitemap', () => {
    it('leaves koobiq.io in the committed files, which the deploy of another site rewrites; run docs:generate-sitemap to update', () => {
        const robotsTxt = readCommitted(ROBOTS_TXT_PATH);

        expect(readCommitted(SITEMAP_PATH)).toBe(renderSitemap(KOOBIQ_SITE_ORIGIN));
        expect(robotsTxt).toBe(renderRobotsTxt(robotsTxt, KOOBIQ_SITE_ORIGIN));
        expect(readCommitted(SITE_ORIGIN_PATH)).toBe(renderSiteOrigin(KOOBIQ_SITE_ORIGIN));
    });

    it('names the site it is built for in the sitemap, in robots.txt and in the origin of the app', () => {
        const urls = Array.from(renderSitemap(NEXT_ORIGIN).matchAll(/<loc>(.*?)<\/loc>/g), ([, url]) => url);

        expect(urls).toContain(`${NEXT_ORIGIN}/en/components/alert/overview`);
        expect(urls.filter((url) => !url.startsWith(`${NEXT_ORIGIN}/`))).toEqual([]);
        expect(renderRobotsTxt(`Sitemap: ${KOOBIQ_SITE_ORIGIN}/sitemap.xml\n\nUser-agent: *\n`, NEXT_ORIGIN)).toContain(
            `Sitemap: ${NEXT_ORIGIN}/sitemap.xml\n\nUser-agent: *\n`
        );
        expect(renderSiteOrigin(NEXT_ORIGIN)).toContain(`export const DOCS_SITE_ORIGIN = '${NEXT_ORIGIN}';`);
    });

    it.each([NEXT_ORIGIN, 'https://v20.koobiq.io', 'https://v19.koobiq.io'])(
        'includes exactly one verification comment for %s across repeated builds',
        (origin) => {
            const stable = readCommitted(ROBOTS_TXT_PATH);
            const robots = renderRobotsTxt(stable, origin);

            expect(robots.split(/\r?\n/).filter((line) => line === EXPECTED_ALGOLIA_VERIFICATION)).toHaveLength(1);
            expect(renderRobotsTxt(robots, origin)).toBe(robots);
            expect(renderRobotsTxt(robots, KOOBIQ_SITE_ORIGIN)).toBe(stable);
        }
    );

    it('preserves CRLF across next and stable builds', () => {
        const stable = readCommitted(ROBOTS_TXT_PATH).replace(/\n/g, '\r\n');
        const next = renderRobotsTxt(stable, NEXT_ORIGIN);

        expect(next).not.toMatch(/(?<!\r)\n/);
        expect(renderRobotsTxt(next, NEXT_ORIGIN)).toBe(next);
        expect(renderRobotsTxt(next, KOOBIQ_SITE_ORIGIN)).toBe(stable);
    });

    it('publishes the content signals for all user agents', () => {
        const robots = renderRobotsTxt(readCommitted(ROBOTS_TXT_PATH), NEXT_ORIGIN);
        const groups = robots.split(/^User-agent:[ \t]*/im).slice(1);
        const wildcard = groups.find((group) => group.split('\n')[0].trim() === '*');
        const signals = wildcard
            ?.match(/^Content-Signal:[ \t]*(.+)$/im)?.[1]
            .split(',')
            .map((signal) => signal.trim());

        expect(signals?.sort()).toEqual(['ai-input=yes', 'ai-train=yes', 'search=yes']);
    });

    it('refuses a robots.txt without the Sitemap line, which it would leave naming no site', () => {
        expect(() => renderRobotsTxt('User-agent: *\n', NEXT_ORIGIN)).toThrow(/no Sitemap line/);
    });
});

describe('docs origin', () => {
    it.each([KOOBIQ_SITE_ORIGIN, NEXT_ORIGIN, 'https://v21.koobiq.io'])(
        'accepts %s with or without a trailing slash',
        (origin) => {
            expect(parseOrigin(origin)).toBe(origin);
            expect(parseOrigin(origin + '/')).toBe(origin);
        }
    );

    it.each(['next.koobiq.io', NEXT_ORIGIN + '/en', 'ftp://koobiq.io'])('rejects %s', (value) => {
        expect(() => parseOrigin(value)).toThrow(/KOOBIQ_DOCS_ORIGIN/);
    });

    it.each([
        ['stable', KOOBIQ_SITE_ORIGIN],
        ['next', NEXT_ORIGIN]
    ])('builds the %s deployment for its public origin', (target, origin) => {
        const workflow = parseDocument(readCommitted(`.github/workflows/docs-${target}.yml`));
        const job = workflow.toJS().jobs.build;

        expect(job.env.KOOBIQ_DOCS_ORIGIN).toBe(origin);
        expect(job.steps).toContainEqual(
            expect.objectContaining({
                uses: expect.stringMatching(/^FirebaseExtended\/action-hosting-deploy@/),
                with: expect.objectContaining({ target })
            })
        );
    });
});
