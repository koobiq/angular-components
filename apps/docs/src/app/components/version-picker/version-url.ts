/** Host the sitemap of every version names, whatever host serves that version. */
const CANONICAL_ORIGIN = 'https://koobiq.io';

const trimTrailingSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * Resolves an address of the docs app, which starts with a slash, in a version. The version URL is taken as a
 * directory, so a version kept below the root of its host keeps its own path.
 */
const resolveInVersion = (appUrl: string, versionUrl: string): string =>
    new URL(`.${appUrl}`, versionUrl.endsWith('/') ? versionUrl : `${versionUrl}/`).href;

/** Address of the sitemap of a docs version. */
export const docsGetVersionSitemapUrl = (versionUrl: string): string => resolveInVersion('/sitemap.xml', versionUrl);

/** Paths of the pages a docs version lists in its sitemap, relative to the root of the docs app. */
export const docsParseSitemapPaths = (xml: string): Set<string> =>
    new Set(
        Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g), ([, loc]) =>
            trimTrailingSlash(new URL(loc, CANONICAL_ORIGIN).pathname)
        )
    );

/**
 * Address in another docs version of the page at `appUrl` (as the router gives it): the same page when the version
 * has it, else the first page of the same item (its overview, or the first tab of the design tokens), else the home
 * page in the same locale, else the root. Without the pages of the version to check against, the root.
 */
export const docsGetVersionPageUrl = (appUrl: string, versionUrl: string, pagePaths: Set<string> | null): string => {
    if (!pagePaths) return resolveInVersion('/', versionUrl);

    const { pathname, search, hash } = new URL(appUrl, CANONICAL_ORIGIN);
    const path = trimTrailingSlash(pathname);

    if (pagePaths.has(path)) return resolveInVersion(`${path}${search}${hash}`, versionUrl);

    const firstPageUnder = (prefix: string): string | undefined => {
        for (const pagePath of pagePaths) {
            if (pagePath.startsWith(`${prefix}/`)) return pagePath;
        }

        return undefined;
    };
    const [locale, category, id] = path.split('/').slice(1);
    const itemPage = id && firstPageUnder(`/${locale}/${category}/${id}`);

    if (itemPage) return resolveInVersion(itemPage, versionUrl);

    // A version may leave the home page of a locale out of its sitemap while still serving the locale.
    if (locale && (pagePaths.has(`/${locale}`) || firstPageUnder(`/${locale}`))) {
        return resolveInVersion(`/${locale}`, versionUrl);
    }

    return resolveInVersion('/', versionUrl);
};
