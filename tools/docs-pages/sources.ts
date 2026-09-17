import { basename } from 'path';
import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import { docsGetItems, DocsStructureItemTab } from '../../apps/docs/src/app/structure';

/** MDX pages of the documentation site. */
export const DOCS_PAGE_SOURCES = ['packages/components/**/*.mdx', 'docs/guides/**/*.mdx', 'docs/data-grid/**/*.mdx'];

/** Overview pages among `DOCS_PAGE_SOURCES`, whose introduction becomes the SEO description. */
export const DOCS_PAGE_OVERVIEW_SOURCES = [
    'packages/components/**/!(examples*).mdx',
    'docs/guides/**/!(examples*).mdx',
    'docs/data-grid/**/!(examples*).mdx'
];

/** `alert.en.mdx` is the overview tab of the alert page, `examples.alert.en.mdx` its examples tab. */
const PAGE_FILE_NAME = /^(?<examples>examples\.)?(?<id>[a-z0-9-]+)\.(?<locale>[a-z]+)\.mdx$/;

export interface DocsPageSource {
    /** Path of the MDX file, relative to the repository root. */
    path: string;
    /** Id of the structure item the page belongs to. */
    id: string;
    tab: DocsStructureItemTab.Overview | DocsStructureItemTab.Examples;
    locale: DocsLocale;
    /** URL of the page, or `null` when `structure.ts` has no item for it, so no route renders it. */
    url: string | null;
}

const isLocale = (value: string | undefined): value is DocsLocale =>
    Object.values<string>(DocsLocale).includes(value ?? '');

/**
 * Route paths of the overview and examples tabs that none of the pages compiles to. The app has no other way
 * to render these tabs, so each of them would stay empty.
 */
export const findRoutesWithoutPage = (routePaths: string[], pages: Pick<DocsPageSource, 'url'>[]): string[] => {
    const pageUrls = new Set(pages.map(({ url }) => url));
    const pageTabs: string[] = [DocsStructureItemTab.Overview, DocsStructureItemTab.Examples];

    return routePaths.filter((path) => pageTabs.includes(path.split('/').at(-1) ?? '') && !pageUrls.has(path));
};

export const parsePageSource = (path: string): DocsPageSource => {
    const groups = basename(path).match(PAGE_FILE_NAME)?.groups;

    if (!groups || !isLocale(groups.locale)) {
        throw new Error(`${path}: expected a file named <id>.<locale>.mdx or examples.<id>.<locale>.mdx`);
    }

    const tab = groups.examples ? DocsStructureItemTab.Examples : DocsStructureItemTab.Overview;
    const item = docsGetItems().find(({ id }) => id === groups.id);

    return {
        path,
        id: groups.id,
        tab,
        locale: groups.locale,
        url: item ? `/${groups.locale}/${item.categoryId}/${item.id}/${tab}` : null
    };
};
