import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';
import { join, posix } from 'path';
import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import { docsGetMarkdownPath } from '../../apps/docs/src/app/page-paths';
import {
    docsGetItemById,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from '../../apps/docs/src/app/structure';
import { EXAMPLE_COMPONENTS } from '../../packages/docs-examples/example-module';
import { DocEntry } from '../api-gen/rendering/entities';
import { DOCS_PAGE_SOURCES, parsePageSource } from '../docs-pages/sources';
import { LlmsExample } from './page-markdown';

export const LLMS_SITE_ORIGIN = 'https://koobiq.io';

/** Where `tools/api-gen` writes the manifest of every entry point. */
const API_MANIFEST_DIR = join('dist', 'docs-content', 'api-manifest');

export const readRepoFile = (path: string): string => readFileSync(join(process.cwd(), path), 'utf-8');

/**
 * The English overview and examples pages of every structure item, by the item and the tab. The documentation for
 * agents is in English only: a model reads it just as well and answers in the language it is asked in.
 */
export type LlmsPageSources = Map<string, string>;

const pageKey = (id: string, tab: DocsStructureItemTab): string => `${id}/${tab}`;

/** Finds the MDX pages the way the documentation site compiles them. */
export const collectPageSources = (): LlmsPageSources =>
    new Map(
        DOCS_PAGE_SOURCES.flatMap((pattern) => globSync(pattern, { windowsPathsNoEscape: true, posix: true }))
            .map(parsePageSource)
            .filter(({ locale }) => locale === DocsLocale.En)
            .map(({ id, tab, path }): [string, string] => [pageKey(id, tab), path])
    );

export const getPageSource = (sources: LlmsPageSources, id: string, tab: DocsStructureItemTab): string | undefined =>
    sources.get(pageKey(id, tab));

/** Path of the Markdown of an item under the site root, next to its English pages: `en/components/button.md`. */
export const getMarkdownPath = (item: DocsStructureItem): string => docsGetMarkdownPath(item).slice(1);

export const getMarkdownUrl = (item: DocsStructureItem): string => `${LLMS_SITE_ORIGIN}${docsGetMarkdownPath(item)}`;

/** The page of an item a person opens first. */
export const getPageUrl = ({ categoryId, id }: DocsStructureItem): string => {
    const tab = id === DocsStructureItemId.DesignTokens ? DocsStructureTokensTab.Colors : DocsStructureItemTab.Overview;

    return `${LLMS_SITE_ORIGIN}/${DocsLocale.En}/${categoryId}/${id}/${tab}`;
};

/** A URL of its own: with a scheme, such as `https:` or `mailto:`, or on another host. */
const isAbsoluteUrl = (url: string): boolean => /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//');

/**
 * Resolves a link of a page for a reader outside the site. A link to another item, in any locale, leads to its
 * Markdown, which holds every tab of the item; any other link within the site gets the origin of the site.
 */
export const resolveSiteUrl = (url: string): string => {
    if (isAbsoluteUrl(url) || url.startsWith('#')) return url;

    // The base href of the site is `/`, so a link without the leading slash leads from its root as well.
    const [path, hash] = (url.startsWith('/') ? url : `/${url}`).split('#');
    const [locale, categoryId, id] = path.split('?')[0].split('/').filter(Boolean);
    const item =
        Object.values<string>(DocsLocale).includes(locale) &&
        docsGetItemById(id as DocsStructureItemId, categoryId as DocsStructureCategoryId);

    if (item) return `${getMarkdownUrl(item)}${hash ? `#${hash}` : ''}`;

    return `${LLMS_SITE_ORIGIN}${path}${hash ? `#${hash}` : ''}`;
};

/** A JSDoc holding nothing but the title the catalogue shows, which the caption of the example already carries. */
const TITLE_ONLY_JSDOC = /^\/\*\*\s*\n\s*\*\s*@title[^\n]*\n\s*\*\/\n/m;

/**
 * Returns the examples of one document with their files. A file several examples import, such as the shared data of
 * the filter bar examples, comes with the first of them only: the document already has it after that.
 */
export const createExampleResolver = (): ((id: string) => LlmsExample) => {
    const emittedSharedFiles = new Set<string>();

    return (id: string): LlmsExample => {
        const example = EXAMPLE_COMPONENTS[id];

        if (!example) throw new Error(`Unknown example "${id}"`);

        const directory = posix.join('packages/docs-examples', example.packagePath);
        const files = example.files.map((name) => ({
            name,
            content: readRepoFile(posix.join(directory, name)).replace(TITLE_ONLY_JSDOC, '')
        }));
        const sharedFiles = example.localImportFiles
            .filter((name) => !emittedSharedFiles.has(posix.join(directory, name)))
            .map((name) => {
                emittedSharedFiles.add(posix.join(directory, name));

                return { name, content: readRepoFile(posix.join(directory, name)) };
            });

        return { id, title: example.title, files: [...files, ...sharedFiles] };
    };
};

const apiManifests = new Map<string, DocEntry[]>();

/** The manifest of an entry point, which `yarn run docs:api-gen` writes. */
export const readApiManifest = (apiId: string): DocEntry[] => {
    const path = join(API_MANIFEST_DIR, `components-${apiId}.json`);

    if (!apiManifests.has(path)) {
        if (!existsSync(path)) throw new Error(`${path} is missing: run "yarn run docs:api-gen" first`);

        apiManifests.set(path, JSON.parse(readFileSync(path, 'utf-8')));
    }

    return apiManifests.get(path)!;
};

/** Version of `@koobiq/icons` the documentation is built with: the icon reference of that very version is linked. */
export const getIconsVersion = (): string =>
    JSON.parse(readFileSync(require.resolve('@koobiq/icons/package.json'), 'utf-8')).version;
