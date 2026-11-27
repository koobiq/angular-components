/**
 * Writes the files that name the address of the site, `DOCS_SITE_ORIGIN`: the sitemap, its line in `robots.txt` and the
 * origin of the canonical links of the pages. The committed files name koobiq.io; `build:docs-content` rewrites them
 * for the site a workflow deploys to another address.
 */
import { readFileSync, writeFileSync } from 'fs';
import { docsGetPagePaths } from '../apps/docs/src/app/page-paths';
import { DOCS_SITE_ORIGIN } from './docs-site-origin';

export const SITEMAP_PATH = 'apps/docs/src/sitemap.xml';
export const ROBOTS_TXT_PATH = 'apps/docs/src/robots.txt';
export const SITE_ORIGIN_PATH = 'apps/docs/src/app/site-origin.ts';

export const renderSitemap = (origin: string): string => {
    const urls = docsGetPagePaths()
        .filter(({ indexable }) => indexable)
        .map(({ path }) => `\t<url>\n\t\t<loc>${origin}${path}</loc>\n\t</url>\n`)
        .join('');

    return `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`;
};

const ALGOLIA_VERIFICATION = '# Algolia-Crawler-Verif: 3871AA90F374600A';
const VERIFIED_ORIGINS = ['https://next.koobiq.io', 'https://v20.koobiq.io', 'https://v19.koobiq.io'];

export const renderRobotsTxt = (robotsTxt: string, origin: string): string => {
    if (!/^Sitemap: /m.test(robotsTxt)) throw new Error(`${ROBOTS_TXT_PATH} has no Sitemap line`);

    const newline = robotsTxt.includes('\r\n') ? '\r\n' : '\n';
    const content = robotsTxt
        .split(/\r?\n/)
        .filter((line) => line !== ALGOLIA_VERIFICATION)
        .join(newline);
    const verification = VERIFIED_ORIGINS.includes(origin) ? ALGOLIA_VERIFICATION + newline : '';

    return verification + content.replace(/^Sitemap: .*$/m, `Sitemap: ${origin}/sitemap.xml`);
};

export const renderSiteOrigin = (origin: string): string => [
        '/**',
        ' * NOTE! Do not edit manually. The address the site is deployed to, from `KOOBIQ_DOCS_ORIGIN`.',
        ' * Run `yarn run docs:generate-sitemap` to update.',
        ' */',
        `export const DOCS_SITE_ORIGIN = '${origin}';`,
        ''
    ].join('\n');

if (require.main === module) {
    writeFileSync(SITEMAP_PATH, renderSitemap(DOCS_SITE_ORIGIN));
    writeFileSync(ROBOTS_TXT_PATH, renderRobotsTxt(readFileSync(ROBOTS_TXT_PATH, 'utf8'), DOCS_SITE_ORIGIN));
    writeFileSync(SITE_ORIGIN_PATH, renderSiteOrigin(DOCS_SITE_ORIGIN));

    console.info(`✅ The sitemap, robots.txt and site-origin.ts name ${DOCS_SITE_ORIGIN}`);
}
