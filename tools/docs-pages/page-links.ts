import type { Nodes, Root } from 'mdast';
import { getHeadingIds } from './compile-page';

/** A documentation page parsed from its MDX. */
export interface ParsedPage {
    path: string;
    root: Root;
}

const getHref = (node: Nodes): string | null => {
    if (node.type === 'link') return node.url;
    if ((node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') || node.name !== 'a') return null;

    const href = node.attributes.find(
        (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'href'
    )?.value;

    return typeof href === 'string' ? href : null;
};

/** The links of a page, written in Markdown or as an `<a>` element. */
export const collectLinks = (node: Nodes): { url: string; line: number }[] => {
    const url = getHref(node);

    return [
        ...(url === null ? [] : [{ url, line: node.position?.start.line ?? 0 }]),
        ...('children' in node ? node.children.flatMap(collectLinks) : [])
    ];
};

/** A link inside the site, with or without its address and the leading slash: the pages use all of these. */
const SITE_LINK = /^(?:https:\/\/koobiq\.io)?\/?((en|ru)\/[^?#]*)[^#]*(?:#(.+))?$/;

/** The language of the site a link leads to; `null` for a link that leaves the site or stays on the page. */
export const getLinkLocale = (url: string): string | null => url.match(SITE_LINK)?.[2] ?? null;

/** A fragment that is not valid percent-encoding is read as it is, the way a browser reads it. */
const decodeFragment = (fragment: string): string => {
    try {
        return decodeURIComponent(fragment);
    } catch {
        return fragment;
    }
};

/** The page and the heading a link names; `null` for a link to no part of a page. A `path` of `null` is the page itself. */
const parseAnchor = (url: string): { path: string | null; fragment: string } | null => {
    if (url.startsWith('#')) return { path: null, fragment: decodeFragment(url.slice(1)) };

    const match = url.match(SITE_LINK);

    return match?.[3] ? { path: `/${match[1].replace(/\/+$/, '')}`, fragment: decodeFragment(match[3]) } : null;
};

/**
 * Links to a part of a page that lead nowhere: the id of a heading comes from its text, so rewording a heading or
 * renaming it in a translation breaks every link to it, and a browser just stays at the top of the page.
 *
 * `sitePaths` are the routes of the site, which include the pages that do not come from MDX, such as an API tab: their
 * headings are not known here, so a link to one is left alone.
 */
export const findBrokenAnchors = (
    pages: (ParsedPage & { url: string | null })[],
    sitePaths: ReadonlySet<string>
): string[] => {
    const headingIds = new Map(pages.map(({ path, root }) => [path, getHeadingIds(root)]));
    const pathsByUrl = new Map(pages.map(({ path, url }) => [url, path]));

    return pages.flatMap(({ path, root }) =>
        collectLinks(root).flatMap(({ url, line }) => {
            const anchor = parseAnchor(url);

            if (!anchor) return [];

            // A link to an item without a tab opens its overview.
            const target =
                anchor.path === null
                    ? path
                    : (pathsByUrl.get(anchor.path) ?? pathsByUrl.get(`${anchor.path}/overview`));

            if (anchor.path !== null && !target) {
                // The files for agents are checked by `check-llms`.
                return sitePaths.has(anchor.path) || /\.(md|txt)$/.test(anchor.path)
                    ? []
                    : [`${path}:${line}: no page for the link ${url}`];
            }

            return target && headingIds.get(target)?.has(anchor.fragment)
                ? []
                : [`${path}:${line}: no heading for the link ${url}`];
        })
    );
};
