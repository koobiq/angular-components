import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';
import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import {
    docsGetCategories,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemTab
} from '../../apps/docs/src/app/structure';
import { DOCS_PAGE_SOURCES, parsePageSource } from '../docs-pages/sources';
import { API_REPORTS_DIR, REPO_ROOT } from './constants';

/** Folder of `agent-docs` each navigation category is written to. */
export const CATEGORY_FOLDERS: Partial<Record<DocsStructureCategoryId, string>> = {
    [DocsStructureCategoryId.Main]: 'guides',
    [DocsStructureCategoryId.Components]: 'components',
    [DocsStructureCategoryId.Other]: 'other'
};

/** A documented item with everything the skill is generated from. Paths are relative to the repository root. */
export interface SkillItem {
    item: DocsStructureItem;
    categoryId: DocsStructureCategoryId;
    /** `agent-docs` path of the generated reference, e.g. `components/button.md`. */
    docPath: string;
    overviewPage: string;
    examplesPage: string | null;
    /** Entry point consumers import the item from, e.g. `@koobiq/components/button`. */
    importPath: string | null;
    /** Entry point directory, e.g. `button` or `scrollbar/deprecated`. */
    entryPoint: string | null;
    apiReport: string | null;
    tokenFiles: string[];
}

export const readRepoFile = (path: string): string => readFileSync(join(REPO_ROOT, path), 'utf-8');

/** Every `@koobiq/components/<name>` path the repository maps in tsconfig.json, without the package prefix. */
export const getEntryPoints = (): string[] => {
    // tsconfig.json is JSONC; its comments sit on their own lines.
    const config = JSON.parse(readRepoFile('tsconfig.json').replace(/^\s*\/\/.*$/gm, ''));

    return Object.keys(config.compilerOptions.paths as Record<string, string[]>)
        .filter((path) => path.startsWith('@koobiq/components/'))
        .map((path) => path.slice('@koobiq/components/'.length));
};

const getEnglishPages = (tab: DocsStructureItemTab): Map<string, string> =>
    new Map(
        DOCS_PAGE_SOURCES.flatMap((pattern) => globSync(pattern, { cwd: REPO_ROOT, posix: true }))
            .map(parsePageSource)
            .filter((page) => page.tab === tab && page.locale === DocsLocale.En)
            .map(({ id, path }): [string, string] => [id, path])
    );

/** The documented items the skill covers: every navigation item that has an English overview page. */
export const collectSkillItems = (): SkillItem[] => {
    const overviews = getEnglishPages(DocsStructureItemTab.Overview);
    const examples = getEnglishPages(DocsStructureItemTab.Examples);
    const entryPoints = new Set(getEntryPoints());

    return docsGetCategories().flatMap((category) => {
        const folder = CATEGORY_FOLDERS[category.id];

        if (!folder) return [];

        return category.items.flatMap((item): SkillItem[] => {
            const overviewPage = overviews.get(item.id);

            if (!overviewPage) return [];

            const entryPoint =
                item.apiId && entryPoints.has(item.apiId)
                    ? item.apiId
                    : item.path?.startsWith('packages/components/core')
                      ? 'core'
                      : null;
            const apiReport = entryPoint
                ? `tools/public_api_guard/components/${entryPoint.replace('/', '-')}.api.md`
                : null;

            return [
                {
                    item,
                    categoryId: category.id,
                    docPath: `${folder}/${item.id}.md`,
                    overviewPage,
                    examplesPage: examples.get(item.id) ?? null,
                    importPath: entryPoint ? `@koobiq/components/${entryPoint}` : null,
                    entryPoint,
                    apiReport: apiReport && existsSync(join(REPO_ROOT, apiReport)) ? apiReport : null,
                    // The component's own tokens; `core` carries shared styles, not a component.
                    tokenFiles:
                        entryPoint && entryPoint !== 'core'
                            ? globSync(`packages/components/${entryPoint}/*-tokens.scss`, {
                                  cwd: REPO_ROOT,
                                  posix: true
                              })
                            : []
                }
            ];
        });
    });
};

/** API reports of every entry point, keyed by the report file name without `.api.md`. */
export const getApiReportPaths = (): Map<string, string> =>
    new Map(
        globSync('*.api.md', { cwd: API_REPORTS_DIR, posix: true }).map((file): [string, string] => [
            file.replace(/\.api\.md$/, ''),
            join(API_REPORTS_DIR, file)
        ])
    );
