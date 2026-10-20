const trimTrailingSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Paths of the pages a docs version lists in its sitemap, whose URLs name the canonical host whatever the version. */
export const docsParseSitemapPaths = (xml: string): Set<string> =>
    new Set(
        Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g), ([, loc]) =>
            trimTrailingSlash(new URL(loc, 'https://koobiq.io').pathname)
        )
    );

/**
 * Address of the open page in another docs version: the same page when the version has it, else the first page of the
 * same item (its overview, or the first tab of the design tokens), else the home page in the same locale, else the
 * root. Without the pages of the version to check against, the root.
 */
export const docsGetVersionPageUrl = (
    { pathname, search, hash }: Pick<Location, 'pathname' | 'search' | 'hash'>,
    versionUrl: string,
    pagePaths: Set<string> | null
): string => {
    const toVersion = (path: string): string => new URL(path, versionUrl).href;

    if (!pagePaths) return toVersion('/');

    const path = trimTrailingSlash(pathname);

    if (pagePaths.has(path)) return toVersion(`${path}${search}${hash}`);

    const firstPageUnder = (prefix: string): string | undefined =>
        Array.from(pagePaths).find((pagePath) => pagePath.startsWith(`${prefix}/`));
    const [locale, category, id] = path.split('/').slice(1);
    const itemPage = id && firstPageUnder(`/${locale}/${category}/${id}`);

    if (itemPage) return toVersion(itemPage);

    // A version may leave the home page of a locale out of its sitemap while still serving the locale.
    if (locale && (pagePaths.has(`/${locale}`) || firstPageUnder(`/${locale}`))) return toVersion(`/${locale}`);

    return toVersion('/');
};
