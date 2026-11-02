import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';
import { join, posix } from 'path';
import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import {
    docsGetApiMarkdownPath,
    docsGetMarkdownPath,
    docsGetPageMarkdownPath,
    docsHasMarkdown
} from '../../apps/docs/src/app/page-paths';
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
import { LlmsExample, LlmsExampleFile } from './page-markdown';

/** The site of the latest major version, which the committed `llms.txt` and the skills link. */
export const KOOBIQ_SITE_ORIGIN = 'https://koobiq.io';

/**
 * The address of the site the documentation for agents is built for: every link in it leads to the same site, so an
 * agent that reads the Markdown of `next.koobiq.io` or of `v21.koobiq.io` stays on that version. The workflow that
 * deploys a site to another address sets `KOOBIQ_DOCS_ORIGIN`.
 */
export const LLMS_SITE_ORIGIN = (process.env.KOOBIQ_DOCS_ORIGIN || KOOBIQ_SITE_ORIGIN).replace(/\/+$/, '');

/** The address of a file of the documentation for agents, by its path under the root of the site. */
export const getSiteUrl = (path: string): string => `${LLMS_SITE_ORIGIN}/${path}`;

/** An example in a file of its own, apart from the pages that show it: `examples/alert-overview.md`. */
export const getExamplePath = (id: string): string => `examples/${id}.md`;

/** The API of an entry point, which every item of the entry point links: `api/button.md`, or a group of it. */
export const getApiPath = (apiId: string, group?: string): string =>
    group ? `api/${apiId}/${group}.md` : docsGetApiMarkdownPath(apiId).slice(1);

/** The variables of a component, from its tokens file: `tokens/button.md`. */
export const getTokensPath = (id: string): string => `tokens/${id}.md`;

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

/** Path of the Markdown of an item under the site root, next to its pages in a locale: `ru/components/button.md`. */
export const getMarkdownPath = (item: DocsStructureItem, locale: DocsLocale): string =>
    docsGetMarkdownPath(item, locale).slice(1);

/** The address a text links the Markdown of an item by: the English one, like the text itself. */
export const getMarkdownUrl = (item: DocsStructureItem): string =>
    `${LLMS_SITE_ORIGIN}${docsGetMarkdownPath(item, DocsLocale.En)}`;

/** Where the sections of a page too long for one file go, next to its English Markdown: `en/main/migration`. */
export const getSectionsPath = (item: DocsStructureItem): string =>
    getMarkdownPath(item, DocsLocale.En).replace(/\.md$/, '');

/** A section of a page in a file of its own: `en/main/migration/upgrade-plan.md`. */
export const getSectionPath = (item: DocsStructureItem, slugs: string[]): string =>
    `${getSectionsPath(item)}/${slugs.join('/')}.md`;

/** The page of an item a person opens first. */
export const getPageUrl = ({ categoryId, id }: DocsStructureItem): string => {
    const tab = id === DocsStructureItemId.DesignTokens ? DocsStructureTokensTab.Colors : DocsStructureItemTab.Overview;

    return `${LLMS_SITE_ORIGIN}/${DocsLocale.En}/${categoryId}/${id}/${tab}`;
};

/** A URL of its own: with a scheme, such as `https:` or `mailto:`, or on another host. */
const isAbsoluteUrl = (url: string): boolean => /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//');

/**
 * Resolves a link of a page for a reader outside the site. A link to another item, in any locale, leads to its
 * Markdown, or to the API of its entry point for the API tab; any other link within the site gets the origin of the
 * site. A link a page writes with the address of koobiq.io counts as a link within the site, so that the Markdown of
 * `next.koobiq.io` or `v21.koobiq.io` keeps to its own version.
 */
export const resolveSiteUrl = (url: string): string => {
    const local = url.startsWith(`${KOOBIQ_SITE_ORIGIN}/`) ? url.slice(KOOBIQ_SITE_ORIGIN.length) : url;

    if (isAbsoluteUrl(local) || local.startsWith('#')) return local;

    // The base href of the site is `/`, so a link without the leading slash leads from its root as well.
    const [path, hash] = (local.startsWith('/') ? local : `/${local}`).split('#');
    const [locale, categoryId, id, tab] = path.split('?')[0].split('/').filter(Boolean);
    const item =
        Object.values<string>(DocsLocale).includes(locale) &&
        docsGetItemById(id as DocsStructureItemId, categoryId as DocsStructureCategoryId);
    const target = item && docsHasMarkdown(item) ? docsGetPageMarkdownPath(item, tab, DocsLocale.En) : path;

    return `${LLMS_SITE_ORIGIN}${target}${hash ? `#${hash}` : ''}`;
};

/** A JSDoc holding nothing but the title the catalogue shows, which the caption of the example already carries. */
const TITLE_ONLY_JSDOC = /^\/\*\*\s*\n\s*\*\s*@title[^\n]*\n\s*\*\/\n/m;

/** A file an example imports from outside its directory, by its path in the repository. */
export interface LlmsSharedExampleFile extends LlmsExampleFile {
    path: string;
}

/**
 * An example with its own files, and apart from them the files it imports from outside its directory, such as the
 * data the examples of the filter bar share.
 */
export const readExample = (id: string): { example: LlmsExample; sharedFiles: LlmsSharedExampleFile[] } => {
    const example = EXAMPLE_COMPONENTS[id];

    if (!example) throw new Error(`Unknown example "${id}"`);

    const directory = posix.join('packages/docs-examples', example.packagePath);
    const files = example.files.map((name) => ({
        name,
        content: readRepoFile(posix.join(directory, name)).replace(TITLE_ONLY_JSDOC, '')
    }));
    const sharedFiles = example.localImportFiles.map((name) => {
        const path = posix.join(directory, name);

        return { name, path, content: readRepoFile(path) };
    });

    return { example: { id, title: example.title, files }, sharedFiles };
};

/**
 * Returns the examples of one document with their files. A file several examples import, such as the shared data of
 * the filter bar examples, comes with the first of them only: the document already has it after that.
 */
export const createExampleResolver = (): ((id: string) => LlmsExample) => {
    const emittedSharedFiles = new Set<string>();

    return (id: string): LlmsExample => {
        const { example, sharedFiles } = readExample(id);
        const newSharedFiles = sharedFiles
            .filter(({ path }) => !emittedSharedFiles.has(path))
            .map(({ name, path, content }): LlmsExampleFile => {
                emittedSharedFiles.add(path);

                return { name, content };
            });

        return { ...example, files: [...example.files, ...newSharedFiles] };
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
