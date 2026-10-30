import { existsSync, readdirSync } from 'fs';
import { posix } from 'path';
import { docsHasMarkdown } from '../../apps/docs/src/app/page-paths';
import {
    docsGetItemById,
    docsGetItems,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab
} from '../../apps/docs/src/app/structure';
import { EXAMPLE_COMPONENTS } from '../../packages/docs-examples/example-module';
import { getNgModuleNames, renderApiAsMarkdown } from '../api-gen/rendering/markdown';
import { groupEntries } from '../api-gen/rendering/signature';
import { renderDesignTokens } from './design-tokens';
import { renderMigrationExtras, resolveBreakingChangesUrl } from './migration-extras';
import { exampleFilesToMarkdown, pageToMarkdown } from './page-markdown';
import { addFile, markdownLink as link, MAX_FILE_LENGTH, splitSections } from './site-files';
import {
    getApiPath,
    getExamplePath,
    getMarkdownUrl,
    getPageSource,
    getPageUrl,
    getSectionsPath,
    getSiteUrl,
    getTokensPath,
    LlmsPageSources,
    readApiManifest,
    readExample,
    readRepoFile,
    resolveSiteUrl
} from './sources';

export interface SiteFilesContext {
    sources: LlmsPageSources;
    /** The files besides the pages of the items, by their path under the root of the site: the pages add to it. */
    files: Map<string, string>;
    /** The item the file of an example names, by the example. */
    exampleItems: Map<string, DocsStructureItem>;
}

const EXAMPLES_DIR = 'packages/docs-examples/components';

/** A file examples share, such as their localized data, apart from them: `examples/shared/filter-bar/localized-data.ts.md`. */
const getSharedExampleFilePath = (source: string): string =>
    `examples/shared/${posix.relative(EXAMPLES_DIR, source)}.md`;

const code = (names: string[]): string => names.map((name) => `\`${name}\``).join(', ');

/**
 * An example with every file of its own. A file it imports from outside its directory gets a file of its own, once
 * for every example that shares it: it is usually data, seldom the point.
 */
const renderExample = (item: DocsStructureItem, id: string, files: Map<string, string>): string => {
    const { example, sharedFiles } = readExample(id);
    const shared = sharedFiles.map(({ name, path, content }) => {
        const sharedPath = getSharedExampleFilePath(path);

        if (!files.has(sharedPath)) {
            files.set(
                sharedPath,
                [
                    `# ${posix.basename(path)}`,
                    `A file the examples of ${link(item.name.en, getMarkdownUrl(item))} share, from \`${path}\`.`,
                    exampleFilesToMarkdown([{ name, content }])
                ].join('\n\n')
            );
        }

        return link(`\`${name}\``, getSiteUrl(sharedPath));
    });

    return [
        `# Example: ${example.title}`,
        `The example \`${example.id}\` of ${link(item.name.en, getMarkdownUrl(item))}.${
            shared.length ? ` It also imports ${shared.join(', ')}.` : ''
        }`,
        exampleFilesToMarkdown(example.files)
    ].join('\n\n');
};

/** Whether an example lives in the directory of the item: `components/select/…` is an example of the select. */
export const ownsExample = (item: DocsStructureItem, id: string): boolean => {
    const directory = EXAMPLE_COMPONENTS[id].packagePath.split('/')[1];

    return [item.id, item.apiId, item.path && posix.basename(item.path)].includes(directory);
};

/**
 * A page with its examples moved to files of their own, each linked by its caption. The file of an example names the
 * item it belongs to, or else the first page that shows it.
 */
const convertPage = (
    item: DocsStructureItem,
    source: string,
    headingDepth: number,
    { files, exampleItems }: SiteFilesContext
): string =>
    pageToMarkdown(readRepoFile(source), {
        path: source,
        headingDepth,
        resolveExample: (id) => readExample(id).example,
        resolveUrl: (url) => resolveBreakingChangesUrl(url) ?? resolveSiteUrl(url),
        linkExample: ({ id }) => {
            const path = getExamplePath(id);
            const named = exampleItems.get(id);

            if (!named || (ownsExample(item, id) && !ownsExample(named, id))) {
                exampleItems.set(id, item);
                files.set(path, renderExample(item, id, files));
            }

            return getSiteUrl(path);
        }
    });

/**
 * The API of an entry point, as its API tab shows it, once for every item that documents it. An API too long for one
 * file is split by the kinds of its entries, which the file of the entry point lists with the names in each, and a
 * kind still too long by its entries.
 */
const renderApi = (apiId: string, files: Map<string, string>): void => {
    const path = getApiPath(apiId);

    if (files.has(path)) return;

    const entries = readApiManifest(apiId);
    const title = `API of \`@koobiq/components/${apiId}\``;
    const ngModules = getNgModuleNames(entries);
    const items = docsGetItems().filter((item) => item.hasApi && item.apiId === apiId);
    const intro = [
        `Documented on ${items.map((item) => link(item.name.en, getMarkdownUrl(item))).join(', ')}.`,
        ngModules.length ? `NgModule: ${code(ngModules)}.` : ''
    ]
        .filter(Boolean)
        .join(' ');
    const full = [`# ${title}`, intro, renderApiAsMarkdown(entries, 2)].join('\n\n');

    if (full.length <= MAX_FILE_LENGTH) {
        files.set(path, full);

        return;
    }

    const apiLink = link(title, getSiteUrl(path));
    const groups = groupEntries(entries).map(({ group, entries: grouped }) => {
        const groupPath = getApiPath(apiId, group.id.replace(/^api-/, ''));
        const groupLink = link(group.title, getSiteUrl(groupPath));
        const text = [`# ${title}: ${group.title}`, `A part of the ${apiLink}.`, renderApiAsMarkdown(grouped, 2)].join(
            '\n\n'
        );

        addFile(
            files,
            groupPath,
            splitSections(text, { path: groupPath.replace(/\.md$/, ''), link: `${groupLink} in ${apiLink}` }, files)
        );

        return `- ${groupLink}: ${code(grouped.map(({ name }) => name))}`;
    });

    files.set(path, [`# ${title}`, intro, 'Split by the kind of its entries:', groups.join('\n')].join('\n\n'));
};

const TOKENS_FILE = /-tokens\.scss$/;

/**
 * The tokens files of an item, next to its code: its own, `button-tokens.scss`, then those of its parts no other item
 * is named after, such as `hint-tokens.scss` next to `form-field-tokens.scss`.
 */
export const findTokensFiles = (item: DocsStructureItem, overview: string | undefined): string[] => {
    const directory = item.path ?? (overview && posix.dirname(overview));

    if (!directory || !existsSync(directory)) return [];

    const own = `${item.id}-tokens.scss`;
    const itemIds = new Set<string>(docsGetItems().map(({ id }) => id));

    return readdirSync(directory)
        .filter((name) => TOKENS_FILE.test(name) && (name === own || !itemIds.has(name.replace(TOKENS_FILE, ''))))
        .sort((a, b) => Number(b === own) - Number(a === own) || a.localeCompare(b))
        .map((name) => posix.join(directory, name));
};

const renderTokens = (item: DocsStructureItem, sources: string[]): string => {
    const theming = docsGetItemById(DocsStructureItemId.Theming, DocsStructureCategoryId.Main)!;

    return [
        `# ${item.name.en} tokens`,
        `The variables of ${link(item.name.en, getMarkdownUrl(item))}, each pointing to a global design token. To restyle the component, set its variable on a selector of yours rather than override its CSS: see ${link('theming', getMarkdownUrl(theming))}.`,
        ...sources.flatMap((source) => [`From \`${source}\`:`, `\`\`\`scss\n${readRepoFile(source).trim()}\n\`\`\``])
    ].join('\n\n');
};

/**
 * The Markdown of an item the site serves next to its pages, short enough to read whole: what the item is and the
 * text of its overview and examples tabs, with every example, the API of its entry point and the variables of its
 * component in files of their own it links to. A page still too long for one file keeps its sections in files of their
 * own. `null` when the item has nothing to show.
 */
export const renderItemPage = (item: DocsStructureItem, context: SiteFilesContext): string | null => {
    if (!docsHasMarkdown(item)) return null;

    const { sources, files } = context;
    const overview = getPageSource(sources, item.id, DocsStructureItemTab.Overview);
    const examples = item.hasExamples ? getPageSource(sources, item.id, DocsStructureItemTab.Examples) : null;
    const api = item.hasApi && item.apiId ? readApiManifest(item.apiId) : null;
    const isDesignTokens = item.id === DocsStructureItemId.DesignTokens;

    if (!overview && !api && !isDesignTokens) return null;

    const tokens = findTokensFiles(item, overview);
    const ngModules = api ? getNgModuleNames(api) : [];

    if (api) renderApi(item.apiId!, files);

    if (tokens.length) addFile(files, getTokensPath(item.id), renderTokens(item, tokens));

    const blocks = [
        `# ${item.name.en}`,
        [
            ...(api ? [`- Entry point: \`@koobiq/components/${item.apiId}\``] : []),
            ...(ngModules.length ? [`- NgModule: ${code(ngModules)}`] : []),
            ...(api ? [`- API: ${getSiteUrl(getApiPath(item.apiId!))}`] : []),
            ...(tokens.length ? [`- Component tokens: ${getSiteUrl(getTokensPath(item.id))}`] : []),
            `- Page: ${getPageUrl(item)}`
        ].join('\n')
    ];

    if (isDesignTokens) return [...blocks, renderDesignTokens(2)].join('\n\n');

    if (overview)
        blocks.push(...(examples ? ['## Overview'] : []), convertPage(item, overview, examples ? 3 : 2, context));

    if (examples) blocks.push('## Examples', convertPage(item, examples, 3, context));

    const page = splitSections(
        blocks.join('\n\n'),
        { path: getSectionsPath(item), link: link(item.name.en, getMarkdownUrl(item)) },
        files
    );

    return item.id === DocsStructureItemId.Migration ? `${page}\n\n${renderMigrationExtras(item, files)}` : page;
};
