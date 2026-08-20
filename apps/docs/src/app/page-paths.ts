import {
    docsGetItems,
    DocsStructureCategoryId,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from './structure';

/**
 * Returns every localized-content path that should be prerendered and indexed, without a locale
 * prefix. An empty string represents the localized welcome page.
 */
export const docsGetIndexablePagePaths = (): string[] => {
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
