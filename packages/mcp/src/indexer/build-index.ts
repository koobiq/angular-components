import { existsSync, globSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import type { ComponentEntry, ComponentIndex, IndexProvenance } from '../types.js';
import { dataDir, git, repoRoot, stagedVersion } from './git.js';
import { parseApiReport } from './parse-api-md.js';
import { parseExampleModule } from './parse-examples.js';
import { parseGuide } from './parse-guide.js';
import { parseIconRenames } from './parse-renames.js';

/**
 * Builds `index.json` and `examples.json` from this repository.
 *
 * Runs against the repository rather than the published package on purpose: the package ships
 * only typings and styles — no MDX and no examples — so the docs surface has to be captured here.
 * Neither file is committed: both are always a snapshot of the working tree, so `build:mcp` runs
 * this on every build, straight into the package it assembles, rather than at release time like
 * `guides.json`/`history.json`.
 *
 *   yarn build:mcp
 */

/** Example sources, keyed by example id then by file name. Loaded only when `get_example` runs. */
export type ExampleSources = Record<string, Record<string, string>>;

const collectExampleSources = (repo: string, index: ComponentIndex): ExampleSources => {
    const sources: ExampleSources = {};

    for (const component of index.components) {
        for (const example of component.examples) {
            const dir = join(repo, 'packages', 'docs-examples', example.packagePath);
            const files: Record<string, string> = {};

            for (const file of example.files) {
                const path = join(dir, file);

                if (existsSync(path)) files[file] = readFileSync(path, 'utf-8').replace(/\r\n/g, '\n');
            }

            if (Object.keys(files).length > 0) sources[example.id] = files;
        }
    }

    return sources;
};

/** Git state of the checkout the index is being built from. Never throws: git may not be there. */
const readProvenance = (repo: string, version: string): IndexProvenance => {
    const read = (args: string[]): string | null => git(repo, args).trim() || null;
    const status = read(['status', '--porcelain']);

    return {
        version,
        commit: read(['rev-parse', '--short', 'HEAD']),
        // A release being staged has no tag yet: `git describe` answers nothing, but the version was
        // just bumped past the newest tag, so that version *is* the tag about to be created.
        tag: read(['describe', '--tags', '--exact-match']) ?? stagedVersion(version),
        dirtyFiles: status ? status.split('\n').filter(Boolean).length : 0
    };
};

/**
 * Headings and opening sentence of a component's documentation page.
 *
 * Reuses the guide parser rather than re-scanning for `#`: that one already knows a `#` inside a
 * fenced block is a shell comment, and these pages are the same MDX.
 */
const readMdxPage = (repo: string, id: string, lang: 'en' | 'ru'): { sections: string[]; summary?: string } => {
    const file = globSync(join('packages', 'components', '**', `${id}.${lang}.mdx`), { cwd: repo })[0];

    if (!file) return { sections: [] };

    const { lede, sections } = parseGuide(readFileSync(join(repo, file), 'utf-8'));
    const summary = lede
        .split('\n')
        .find((line) => line.trim().length > 0)
        ?.trim();

    return { sections: sections.map((section) => section.heading), ...(summary ? { summary } : {}) };
};

/**
 * Import path per entry point, keyed the way an API report is named.
 *
 * Not `@koobiq/components/<id>`, because some entry points are nested and their report flattens the
 * slash: `scrollbar-deprecated.api.md` describes `@koobiq/components/scrollbar/deprecated`, and the
 * flattened spelling resolves to nothing. An entry point is a directory with an `ng-package.json`,
 * so the repository's own layout is what gets read rather than a list kept in step by hand.
 */
const readEntryPoints = (repo: string): Map<string, string> =>
    new Map(
        globSync(join('packages', 'components', '**', 'ng-package.json'), { cwd: repo })
            .map((file) => dirname(file).split(sep).slice(2).join('/'))
            // The root barrel of `@koobiq/components` carries one too, and slices to nothing.
            .filter((path) => path.length > 0)
            .map((path): [string, string] => [path.replace(/\//g, '-'), path])
    );

export const buildIndex = (repo: string): ComponentIndex => {
    const guardDir = join(repo, 'tools', 'public_api_guard', 'components');
    const entryPoints = readEntryPoints(repo);
    const { version } = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf-8')) as { version: string };

    const examplesByComponent = parseExampleModule(
        readFileSync(join(repo, 'packages', 'docs-examples', 'example-module.ts'), 'utf-8')
    );

    const guards = new Map(
        readdirSync(guardDir)
            .filter((file) => file.endsWith('.api.md'))
            .map((file): [string, string] => [basename(file, '.api.md'), join(guardDir, file)])
    );

    // Eight documentation groups carry examples without a report of their own — `validation` and
    // `forms` among them. Keying the index on reports alone silently dropped their 65 examples.
    const ids = [...new Set([...guards.keys(), ...examplesByComponent.keys()])].sort();

    const components: ComponentEntry[] = ids.map((id) => {
        const guard = guards.get(id);
        const en = readMdxPage(repo, id, 'en');
        const ru = readMdxPage(repo, id, 'ru');

        return {
            id,
            importPath: guard ? `@koobiq/components/${entryPoints.get(id) ?? id}` : null,
            apiGuarded: Boolean(guard),
            symbols: guard ? parseApiReport(readFileSync(guard, 'utf-8')) : [],
            examples: (examplesByComponent.get(id) ?? []).sort((a, b) => a.id.localeCompare(b.id)),
            sections: en.sections,
            sectionsRu: ru.sections,
            ...(en.summary ? { summary: en.summary } : {}),
            ...(ru.summary ? { summaryRu: ru.summary } : {})
        };
    });

    const renamesFile = join(repo, 'packages', 'schematics', 'src', 'migrations', 'icons-replacement', 'data.ts');

    const iconRenames = existsSync(renamesFile) ? parseIconRenames(readFileSync(renamesFile, 'utf-8')) : [];

    return {
        generatedAt: new Date().toISOString(),
        sourceVersion: version,
        provenance: readProvenance(repo, version),
        components,
        iconRenames
    };
};

const main = (): void => {
    const repo = resolve(process.argv[2] ?? process.env.KOOBIQ_REPO ?? repoRoot());
    // Unlike `guides.json`/`history.json`, this pair is never committed: `yarn build:mcp` runs this
    // on every build, straight from the working tree, and `copy-to-dist.cjs` ships whatever is here
    // alongside the two committed files. `build:mcp:data` does not call this builder any more —
    // there is nothing here for the release pipeline to commit.
    const index = buildIndex(repo);
    const sources = collectExampleSources(repo, index);

    mkdirSync(dataDir(), { recursive: true });
    writeFileSync(join(dataDir(), 'index.json'), JSON.stringify(index) + '\n');
    writeFileSync(join(dataDir(), 'examples.json'), JSON.stringify(sources) + '\n');

    const symbols = index.components.reduce((total, entry) => total + entry.symbols.length, 0);
    const members = index.components.reduce(
        (total, entry) => total + entry.symbols.reduce((inner, symbol) => inner + symbol.members.length, 0),
        0
    );
    const examples = index.components.reduce((total, entry) => total + entry.examples.length, 0);
    const selectors = index.components.reduce(
        (total, entry) => total + entry.symbols.filter((symbol) => symbol.selector).length,
        0
    );

    const russian = index.components.reduce(
        (total, entry) => total + entry.sectionsRu.length + (entry.summaryRu ? 1 : 0),
        0
    );

    const files = Object.values(sources).reduce((total, group) => total + Object.keys(group).length, 0);

    process.stdout.write(
        [
            `koobiq@${index.sourceVersion} -> ${dataDir()}`,
            `  entry points   ${index.components.length}`,
            `  symbols        ${symbols}`,
            `  members        ${members}`,
            `  selectors      ${selectors}`,
            `  examples       ${examples}`,
            `  example files  ${files}`,
            `  icon renames   ${index.iconRenames.length}`,
            `  russian strings ${russian}`,
            ''
        ].join('\n')
    );
};

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) main();
