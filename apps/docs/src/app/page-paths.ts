import { DOCS_SUPPORTED_LOCALES } from './constants/locale';
import {
    docsGetItems,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from './structure';

export type DocsPagePath = {
    path: string;
    indexable: boolean;
};

const getLocalizedContentPaths = (): string[] => {
    const paths = docsGetItems().flatMap(({ categoryId, id, hasApi, hasExamples }) => {
        if (id === DocsStructureItemId.DesignTokens) {
            return Object.values(DocsStructureTokensTab).map((tab) => `${categoryId}/${id}/${tab}`);
        }

        if (id === DocsStructureItemId.Icons) return [`${categoryId}/${id}`];

        const tabs = [`${categoryId}/${id}/${DocsStructureItemTab.Overview}`];

        if (hasApi) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Api}`);
        if (hasExamples) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Examples}`);

        return tabs;
    });

    return ['', ...paths];
};

/**
 * Whether `tools/llms` writes the Markdown of a structure item. The icons page has none: it is built from the metadata
 * of `@koobiq/icons`, and `llms.txt` links the reference that package publishes for agents instead.
 */
export const docsHasMarkdown = ({ id }: Pick<DocsStructureItem, 'id'>): boolean => id !== DocsStructureItemId.Icons;

/**
 * Path of the Markdown of a structure item for agents — the text of its tabs, linking its examples, the API of its entry
 * point and its tokens — next to its pages in a locale: `/ru/components/button.md`. `tools/llms` writes the same English
 * text under every locale, so that a page links the Markdown at its own address: a model reads English just as well and
 * answers in the language it is asked in.
 */
export const docsGetMarkdownPath = (
    { categoryId, id }: Pick<DocsStructureItem, 'categoryId' | 'id'>,
    locale: string
): string => `/${locale}/${categoryId}/${id}.md`;

/** Path of the API of an entry point for agents, which the items of the entry point share: `/api/button.md`. */
export const docsGetApiMarkdownPath = (apiId: string): string => `/api/${apiId}.md`;

/** The Markdown of a page of an item: the API of its entry point for the API tab, the Markdown of the item otherwise. */
export const docsGetPageMarkdownPath = (
    item: Pick<DocsStructureItem, 'categoryId' | 'id' | 'apiId'>,
    tab: string | undefined,
    locale: string
): string =>
    tab === DocsStructureItemTab.Api && item.apiId
        ? docsGetApiMarkdownPath(item.apiId)
        : docsGetMarkdownPath(item, locale);

/** Returns every application page that should be prerendered and whether it belongs in the sitemap. */
export const docsGetPagePaths = (): DocsPagePath[] => {
    const localizedPages = DOCS_SUPPORTED_LOCALES.flatMap((locale) =>
        getLocalizedContentPaths().map((path) => ({
            path: `/${locale}${path ? `/${path}` : ''}`,
            indexable: true
        }))
    );

    return [
        { path: '/', indexable: false },
        ...localizedPages,
        { path: '/404', indexable: false }
    ];
};
