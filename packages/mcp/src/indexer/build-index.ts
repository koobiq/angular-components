import { existsSync, globSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import type { ComponentEntry, ComponentIndex, IndexProvenance } from '../types.js';
import { dataDir, git, repoRoot } from './git.js';
import { parseApiReport } from './parse-api-md.js';
import { parseExampleModule } from './parse-examples.js';
import { parseGuide } from './parse-guide.js';
import { parseIconRenames } from './parse-renames.js';

/**
 * Builds `data/index.json` from this repository.
 *
 * Runs against the repository rather than the published package on purpose: the package ships
 * only typings and styles — no MDX and no examples — so the docs surface has to be captured at
 * build time. This belongs in that repository's CI; see TODO.md.
 *
 *   yarn build:mcp:data
 */

const indexPath = join(dataDir(), 'index.json');
const examplesPath = join(dataDir(), 'examples.json');

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
        tag: read(['describe', '--tags', '--exact-match']),
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

export const buildIndex = (repo: string): ComponentIndex => {
    const guardDir = join(repo, 'tools', 'public_api_guard', 'components');
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
            importPath: guard ? `@koobiq/components/${id}` : null,
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
    const index = buildIndex(repo);
    const sources = collectExampleSources(repo, index);

    mkdirSync(dataDir(), { recursive: true });
    writeFileSync(indexPath, JSON.stringify(index) + '\n');
    writeFileSync(examplesPath, JSON.stringify(sources) + '\n');

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
