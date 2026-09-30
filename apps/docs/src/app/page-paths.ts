import { DOCS_SUPPORTED_LOCALES } from './constants/locale';
import {
    docsGetItems,
    DocsStructureCategoryId,
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

        const tabs = [`${categoryId}/${id}/${DocsStructureItemTab.Overview}`];

        if (hasApi) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Api}`);
        if (hasExamples) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Examples}`);

        return tabs;
    });

    return ['', ...paths, DocsStructureCategoryId.Icons];
};

/**
 * Path of the Markdown of a structure item — every tab of it in one file, for agents — next to its pages in a locale:
 * `/ru/components/button.md`. `tools/llms` writes the same English text under every locale, so that a page links the
 * Markdown at its own address: a model reads English just as well and answers in the language it is asked in.
 */
export const docsGetMarkdownPath = (
    { categoryId, id }: Pick<DocsStructureItem, 'categoryId' | 'id'>,
    locale: string
): string => `/${locale}/${categoryId}/${id}.md`;

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
