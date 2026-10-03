import {
    DocsStructureCategory,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab
} from '../../apps/docs/src/app/structure';
import { pageSummary } from './page-markdown';
import {
    createExampleResolver,
    getMarkdownUrl,
    getPageSource,
    LLMS_SITE_ORIGIN,
    LlmsPageSources,
    readRepoFile,
    resolveSiteUrl
} from './sources';

export const LLMS_TXT = 'llms.txt';
export const LLMS_FULL_TXT = 'llms-full.txt';

export interface LlmsHeader {
    /** Version of `@koobiq/components`. */
    version: string;
    /** The Angular versions the package supports, as `requiredAngularVersion` writes them. */
    angularVersion: string;
    /** Version of `@koobiq/icons`, whose own llms.txt is linked. */
    iconsVersion: string;
    /** Hand-written rules for code that uses Koobiq, which open both files. */
    rules: string;
}

/** A category of the documentation with the items that have Markdown of their own. */
export interface LlmsCategory {
    category: DocsStructureCategory;
    items: DocsStructureItem[];
}

const TITLE = 'Koobiq Angular';

const SUMMARY =
    'Koobiq is an open-source design system for designers and developers, focused on designing products related to **information security**.';

/** The design tokens page is built from data rather than compiled from a page, so it has no introduction to quote. */
const DESIGN_TOKENS_SUMMARY =
    'The global CSS custom properties (`--kbq-*`) of the themes: colors, typography, shadows, border radius and sizes.';

const getMajor = (version: string): string => version.replace(/^\D*/, '').split('.')[0];

const renderPackage = ({ version, angularVersion }: LlmsHeader): string =>
    `\`@koobiq/components\` ${getMajor(version)}.x for Angular ${getMajor(angularVersion)}.`;

const renderIconLinks = ({ iconsVersion }: LlmsHeader): string => {
    const base = `https://raw.githubusercontent.com/koobiq/icons/${iconsVersion}`;

    return [
        `- [Icons](${base}/llms.txt): the llms.txt of \`@koobiq/icons\` ${iconsVersion}, with its packages, the naming of the icons and how to import them.`,
        `- [Icon reference](${base}/llms-full.txt): every icon name with its sizes, tags and imports.`
    ].join('\n');
};

const getSummary = (item: DocsStructureItem, sources: LlmsPageSources): string | null => {
    if (item.id === DocsStructureItemId.DesignTokens) return DESIGN_TOKENS_SUMMARY;

    const path = getPageSource(sources, item.id, DocsStructureItemTab.Overview);

    return path
        ? pageSummary(readRepoFile(path), { path, resolveExample: createExampleResolver(), resolveUrl: resolveSiteUrl })
        : null;
};

const renderItemLink = (item: DocsStructureItem, sources: LlmsPageSources): string => {
    const notes = [
        getSummary(item, sources),
        item.hasApi && item.apiId ? `Entry point: \`@koobiq/components/${item.apiId}\`.` : null
    ].filter(Boolean);

    return `- [${item.name.en}](${getMarkdownUrl(item)})${notes.length ? `: ${notes.join(' ')}` : ''}`;
};

/**
 * The index of the documentation for agents, in the llms.txt format (https://llmstxt.org): the rules of using Koobiq,
 * then one line per item, which links its Markdown and says what the item is for.
 */
export const renderLlmsTxt = (categories: LlmsCategory[], sources: LlmsPageSources, header: LlmsHeader): string => [
        `# ${TITLE}`,
        `> ${SUMMARY}`,
        `${renderPackage(header)} Every link below leads to one item of the documentation as Markdown, in English, in the order of its tabs: the overview with the full source of its examples, the API, the extra examples. Without \`.md\`, the address opens the page itself.`,
        header.rules,
        ...categories
            .filter(({ category }) => category.id !== DocsStructureCategoryId.Icons)
            .map(({ category, items }) =>
                [`## ${category.name.en}`, items.map((item) => renderItemLink(item, sources)).join('\n')].join('\n\n')
            ),
        `## Icons\n\n${renderIconLinks(header)}`,
        `## Optional\n\n- [Full documentation](${LLMS_SITE_ORIGIN}/${LLMS_FULL_TXT}): every item above in one file, several megabytes long: search it rather than read it whole.`
    ].join('\n\n') + '\n';

/** Every item of the index in one file, in English: for indexing and search rather than for reading whole. */
export const renderLlmsFullTxt = (items: string[], header: LlmsHeader): string => [
        `# ${TITLE}: full documentation`,
        `> ${SUMMARY}`,
        `${renderPackage(header)} This file holds every item of ${LLMS_SITE_ORIGIN}/${LLMS_TXT} in English, one after another.`,
        header.rules,
        ...items,
        `## Icons\n\n${renderIconLinks(header)}`
    ].join('\n\n') + '\n';
