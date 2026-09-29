import { DocsStructureItem, DocsStructureItemId, DocsStructureItemTab } from '../../apps/docs/src/app/structure';
import { getNgModuleNames, renderApiAsMarkdown } from '../api-gen/rendering/markdown';
import { renderDesignTokens } from './design-tokens';
import { pageToMarkdown } from './page-markdown';
import {
    createExampleResolver,
    getPageSource,
    getPageUrl,
    LlmsPageSources,
    readApiManifest,
    readRepoFile,
    resolveSiteUrl
} from './sources';

export interface RenderItemOptions {
    /** Depth of the title of the item: 1 in a file of its own, 2 inside a file of many items. */
    depth: number;
    /**
     * The item that already lists the API of an entry point, by the entry point, for a file of many items to list each
     * API once. Button and Button Group share `@koobiq/components/button`: the second only points at the first.
     */
    apiListedBy?: Map<string, DocsStructureItem>;
}

/**
 * Everything the documentation says about one structure item, in one Markdown document and in the order of its tabs:
 * the overview with the full source of its examples, the API of its entry point, then the extra examples. `null` when
 * the item has nothing to show.
 */
export const renderItemMarkdown = (
    item: DocsStructureItem,
    sources: LlmsPageSources,
    { depth, apiListedBy }: RenderItemOptions
): string | null => {
    const heading = (level: number) => '#'.repeat(depth + level);
    const overview = getPageSource(sources, item.id, DocsStructureItemTab.Overview);
    // An item without the tab may still have its page: a placeholder the site does not route to.
    const examples = item.hasExamples ? getPageSource(sources, item.id, DocsStructureItemTab.Examples) : null;
    const api = item.hasApi && item.apiId ? readApiManifest(item.apiId) : null;
    const entryPoint = item.apiId && `@koobiq/components/${item.apiId}`;
    const isDesignTokens = item.id === DocsStructureItemId.DesignTokens;

    if (!overview && !api && !isDesignTokens) return null;

    const ngModules = api ? getNgModuleNames(api) : [];
    const blocks = [
        `${heading(0)} ${item.name.en}`,
        [
            ...(api ? [`- Entry point: \`${entryPoint}\``] : []),
            ...(ngModules.length ? [`- NgModule: ${ngModules.map((name) => `\`${name}\``).join(', ')}`] : []),
            `- Page: ${getPageUrl(item)}`
        ].join('\n')
    ];

    if (isDesignTokens) return [...blocks, renderDesignTokens(depth + 1)].join('\n\n');

    // The examples of one document share a resolver: a file several of them import is shown once.
    const resolveExample = createExampleResolver();
    const hasTabs = !!api || !!examples;
    const pageMarkdown = (path: string, headingDepth: number): string =>
        pageToMarkdown(readRepoFile(path), { path, headingDepth, resolveExample, resolveUrl: resolveSiteUrl });

    if (overview) {
        if (hasTabs) blocks.push(`${heading(1)} Overview`);

        blocks.push(pageMarkdown(overview, depth + (hasTabs ? 2 : 1)));
    }

    if (api && item.apiId) {
        const listedBy = apiListedBy?.get(item.apiId);

        blocks.push(
            `${heading(1)} API`,
            listedBy
                ? `The API of \`${entryPoint}\` is listed under ${listedBy.name.en}.`
                : renderApiAsMarkdown(api, depth + 2)
        );

        if (!listedBy) apiListedBy?.set(item.apiId, item);
    }

    if (examples) blocks.push(`${heading(1)} Examples`, pageMarkdown(examples, depth + 2));

    return blocks.filter(Boolean).join('\n\n');
};
