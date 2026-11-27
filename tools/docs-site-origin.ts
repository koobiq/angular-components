/** The site of the latest major version, which the committed files that name the address of the site link. */
export const KOOBIQ_SITE_ORIGIN = 'https://koobiq.io';

/** The origin a workflow sets, refused unless it is one: without its scheme, every link built from it is relative. */
export const parseOrigin = (value: string): string => {
    const origin = value.replace(/\/+$/, '');
    let parsed: URL | undefined;

    try {
        parsed = new URL(origin);
    } catch {
        parsed = undefined;
    }

    if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
        throw new Error(`KOOBIQ_DOCS_ORIGIN is an origin such as https://next.koobiq.io, not "${value}"`);
    }

    return origin;
};

/**
 * The address of the site being built, which the deploy workflow sets in `KOOBIQ_DOCS_ORIGIN`: the canonical links of
 * its pages, its sitemap and the links of its documentation for agents name it, so a search engine indexes
 * `next.koobiq.io` and `v21.koobiq.io` as sites of their own, and an agent that reads one of them stays on it.
 */
export const DOCS_SITE_ORIGIN = parseOrigin(process.env['KOOBIQ_DOCS_ORIGIN'] || KOOBIQ_SITE_ORIGIN);
