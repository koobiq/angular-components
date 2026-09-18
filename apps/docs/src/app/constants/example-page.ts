import { DefaultUrlSerializer, PRIMARY_OUTLET, UrlSegment } from '@angular/router';

/** First URL segment of the page that shows a single live example. */
export const DOCS_EXAMPLE_PAGE_PATH = 'examples';

/** URL of the page that shows the live example with the given id on its own. */
export const docsExamplePageUrl = (id: string): string => `/${DOCS_EXAMPLE_PAGE_PATH}/${id}`;

/** Whether the URL segments lead to the page of a single live example: the page path, then the id of the example. */
export const docsIsExamplePagePath = ([section, id]: UrlSegment[]): boolean =>
    section?.path === DOCS_EXAMPLE_PAGE_PATH && !!id?.path;

const urlSerializer = new DefaultUrlSerializer();

/**
 * Whether the URL opens the page of a single live example, which has no site navigation. The URL is parsed as the
 * router parses it, so matrix parameters and percent-encoding do not set the two apart.
 */
export const docsIsExamplePageUrl = (url: string): boolean => {
    try {
        return docsIsExamplePagePath(urlSerializer.parse(url).root.children[PRIMARY_OUTLET]?.segments ?? []);
    } catch {
        // The router does not match a URL it cannot parse either.
        return false;
    }
};
