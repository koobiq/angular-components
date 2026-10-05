import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readComponentsApi, type ComponentsApi } from './sources/components.js';
import type { ApiHistory } from './sources/history.js';
import { readIcons } from './sources/icons.js';
import { resolveProject, type ProjectContext } from './sources/project.js';
import { readTokens, type ThemedToken } from './sources/tokens.js';
import type { ComponentIndex, Guide, Icon, SourceResult } from './types.js';

/**
 * Everything the tools read, assembled once per process.
 *
 * Two kinds of data meet here. The component index is generated from the repository and ships
 * with this package, because the published `@koobiq/components` carries no MDX and no examples.
 * Icons and tokens are read out of the consumer's own `node_modules`, so they always match the
 * versions that project actually resolved — which is also why they can fail, and why every
 * failure is carried rather than thrown.
 */

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data');

export type ExampleSources = Record<string, Record<string, string>>;

export type Catalog = {
    project: ProjectContext;
    index: ComponentIndex;
    icons: SourceResult<Icon[]>;
    tokens: SourceResult<ThemedToken[]>;
    /** Lazy: ~2 MB of example sources that most calls never touch. */
    examples: () => ExampleSources;
    /** Lazy: ~1 MB, over half of it the migration guide's own history. */
    guides: () => Guide[];
    /**
     * The API of the installed `@koobiq/components`, parsed from its own `.d.ts`.
     *
     * `null` when the package is not installed — a project that has not run `npm install` yet, or
     * one on React. Lazy and cached: 40 ms for all 64 entry points, 13 ms for a single one plus
     * `core`, and most answers touch one.
     */
    api: () => ComponentsApi | null;
    /** Lazy: 392 KB of per-release API diffs, touched only by `migrate`. */
    history: () => ApiHistory;
};

const EMPTY_INDEX: ComponentIndex = {
    generatedAt: '',
    sourceVersion: 'unknown',
    components: [],
    iconRenames: []
};

const readJson = <T>(path: string, fallback: T): T => {
    if (!existsSync(path)) return fallback;

    try {
        return JSON.parse(readFileSync(path, 'utf-8')) as T;
    } catch {
        return fallback;
    }
};

export const loadCatalog = (cwd: string = process.cwd()): Catalog => {
    const project = resolveProject(cwd);
    let examples: ExampleSources | null = null;
    let guides: Guide[] | null = null;
    let api: ComponentsApi | null | undefined;
    let history: ApiHistory | null = null;

    return {
        project,
        index: readJson(join(dataDir, 'index.json'), EMPTY_INDEX),
        icons: readIcons(project.packages.get('@koobiq/icons')),
        tokens: readTokens(project.packages.get('@koobiq/design-tokens')),
        examples: () => (examples ??= readJson(join(dataDir, 'examples.json'), {})),
        guides: () => (guides ??= readJson<Guide[]>(join(dataDir, 'guides.json'), [])),
        api: () => (api === undefined ? (api = readComponentsApi(project.packages.get('@koobiq/components'))) : api),
        history: () => (history ??= readJson<ApiHistory>(join(dataDir, 'history.json'), {}))
    };
};

/**
 * Set when the project resolved a release line the bundled index was not built from.
 *
 * Icons and tokens are read live, so they are right by construction; the component index is not —
 * it ships with this package. A project on 19.x asking a 20.x index gets answers that look exactly
 * as confident as correct ones, which is the failure mode worth shouting about.
 */
export const indexSkew = (catalog: Catalog): string | null => {
    const { provenance, sourceVersion } = catalog.index;
    const installed = catalog.project.packages.get('@koobiq/components');
    const problems: string[] = [];

    // Checked first because it outranks any version comparison: an index built off a tag describes
    // a release, and an index built off a working tree describes code that may exist nowhere else.
    // `KbqThemeSelector.Light` is real in the components repo today and absent from every published
    // 20.x — an agent told about it writes code that cannot compile, and no version number differs.
    if (provenance && !provenance.tag) {
        const at = provenance.commit ? ` at ${provenance.commit}` : '';
        const dirty = provenance.dirtyFiles > 0 ? `, ${provenance.dirtyFiles} file(s) modified` : '';

        problems.push(
            `the bundled index was built from an untagged checkout${at}${dirty}, not from a release — it can describe API that no published version contains`
        );
    }

    if (installed) {
        const indexMajor = Number(sourceVersion.split('.')[0]);

        if (!Number.isNaN(indexMajor) && installed.major !== indexMajor) {
            problems.push(
                `this project resolved @koobiq/components@${installed.version} but the index is from ${sourceVersion} — a different major. Install the matching major of @koobiq/mcp`
            );
        } else if (installed.version !== sourceVersion) {
            problems.push(`project is on ${installed.version}, index is from ${sourceVersion}`);
        }
    }

    return problems.length > 0 ? problems.join('; ') : null;
};

/**
 * Set when this project is on a Koobiq line this server has no data for.
 *
 * Worth its own check rather than falling out of a version comparison: React Koobiq is a separate
 * product with its own component names and its own markup, and every answer this server can give
 * is Angular. Staying quiet means handing a React project `<kbq-button>` — syntactically plausible
 * output that cannot work, which is the most expensive kind of wrong answer an agent can receive.
 */
export const frameworkMismatch = (catalog: Catalog): string | null => {
    if (catalog.project.framework !== 'react') return null;

    const installed = [...catalog.project.packages.keys()].filter((name) => name.startsWith('@koobiq/react'));

    return (
        `this project resolved ${installed.join(', ')} — Koobiq for React. This server indexes only ` +
        `Koobiq for Angular; its component names, selectors and examples do not apply here. Do not ` +
        `translate the answers below into React. Icons and design tokens are shared between the two ` +
        `lines and are safe to use.`
    );
};

/** One line naming every resolved version, so an answer can never be mistaken for another line's. */
export const describeContext = (catalog: Catalog): string => {
    const mismatch = frameworkMismatch(catalog);

    if (mismatch) return `FRAMEWORK MISMATCH: ${mismatch}`;

    const parts = [`index built from @koobiq/components@${catalog.index.sourceVersion}`];

    for (const [name, pkg] of catalog.project.packages) parts.push(`${name}@${pkg.version} (project)`);

    const skew = indexSkew(catalog);

    if (skew) parts.push(`VERSION MISMATCH: ${skew}`);

    // Stated whatever else matched. A search for an icon that returns a design token instead is a
    // miss the caller cannot see: it looks like an answer, and the reason the icons were not
    // searched at all is not in it.
    parts.push(
        catalog.icons.ok
            ? catalog.icons.degraded
                ? `icons: ${catalog.icons.degraded}`
                : ''
            : `icons unavailable — ${catalog.icons.reason}`
    );
    parts.push(
        catalog.tokens.ok
            ? catalog.tokens.degraded
                ? `tokens: ${catalog.tokens.degraded}`
                : ''
            : `tokens unavailable — ${catalog.tokens.reason}`
    );

    return parts.filter(Boolean).join('; ');
};
