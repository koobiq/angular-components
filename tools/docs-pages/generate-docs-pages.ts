/**
 * Compiles the MDX pages of the documentation site into Angular components under `dist/docs-pages`,
 * which the docs app imports as `@koobiq/docs-pages`. With `--watch`, recompiles on every change.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, watch, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { dirname, join } from 'path';
import { docsGetPagePaths } from '../../apps/docs/src/app/page-paths';
import { EXAMPLE_COMPONENTS } from '../../packages/docs-examples/example-module';
import { compilePage } from './compile-page';
import { emitPage, emitPagesRegistry } from './emit-page';
import { docsIsMigrationSource } from './migration/migration-steps';
import { docsMigrationGuideLayout } from './migration/wrap-migration-steps';
import { DOCS_PAGE_SOURCES, findRoutesWithoutPage, parsePageSource } from './sources';

const OUTPUT_DIR = join('dist', 'docs-pages');

// The last release: a release commit sets it, and CI stamps the same version into the packages.
const RELEASE: string = JSON.parse(readFileSync('package.json', 'utf8')).version;

const findSources = (): string[] =>
    DOCS_PAGE_SOURCES.flatMap((pattern) => globSync(pattern, { windowsPathsNoEscape: true, posix: true })).sort();

const listOutputFiles = (): string[] =>
    existsSync(OUTPUT_DIR)
        ? readdirSync(OUTPUT_DIR, { recursive: true, withFileTypes: true })
              .filter((entry) => entry.isFile())
              .map((entry) => join(entry.parentPath, entry.name))
        : [];

/** Writes only what changed and removes what is gone, so a dev server rebuilds just the edited page. */
const syncOutput = (files: Map<string, string>): void => {
    for (const [path, content] of files) {
        if (existsSync(path) && readFileSync(path, 'utf8') === content) continue;

        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, content);
    }

    for (const path of listOutputFiles()) {
        if (!files.has(path)) rmSync(path);
    }
};

const generate = (): void => {
    const pagesByKey = new Map<string, string>();
    const pages = findSources().map((path) => {
        const source = parsePageSource(path);
        const key = `${source.id}/${source.tab}/${source.locale}`;

        if (pagesByKey.has(key)) throw new Error(`${path}: ${pagesByKey.get(key)} is the same page`);

        pagesByKey.set(key, path);

        if (!source.url) {
            console.warn(`${path}: apps/docs/src/app/structure.ts has no item "${source.id}", no route renders it`);
        }

        const page = compilePage(readFileSync(path, 'utf8'), {
            path,
            examples: EXAMPLE_COMPONENTS,
            url: source.url,
            layout: docsIsMigrationSource(path) ? docsMigrationGuideLayout(path, RELEASE) : undefined
        });

        return { source, ...emitPage(page, source) };
    });
    const routesWithoutPage = findRoutesWithoutPage(
        docsGetPagePaths().map(({ path }) => path),
        pages.map(({ source }) => source)
    );

    if (routesWithoutPage.length > 0) {
        throw new Error(
            `No MDX page renders ${routesWithoutPage.join(', ')}: add <id>.<locale>.mdx or examples.<id>.<locale>.mdx`
        );
    }

    const files = new Map<string, string>([[join(OUTPUT_DIR, 'index.ts'), emitPagesRegistry(pages)]]);

    for (const { modulePath, component, template } of pages) {
        files.set(join(OUTPUT_DIR, `${modulePath}.ts`), component);
        files.set(join(OUTPUT_DIR, `${modulePath}.html`), template);
    }

    syncOutput(files);

    console.log(`Compiled ${pages.length} MDX pages into ${OUTPUT_DIR}`);
};

const run = (): boolean => {
    try {
        generate();

        return true;
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);

        return false;
    }
};

if (process.argv.includes('--watch')) {
    run();

    // One save arrives as several events, and a run compiles every page, so the runs are collapsed into one.
    let pending: NodeJS.Timeout | undefined;

    const scheduleRun = (path: string): void => {
        console.log(`${path} changed`);
        clearTimeout(pending);
        pending = setTimeout(run, 50);
    };

    // The example catalogue is read once: restart the watcher after adding an example.
    for (const directory of ['packages/components', 'docs']) {
        watch(directory, { recursive: true }, (_event, fileName) => {
            if (fileName?.endsWith('.mdx')) {
                scheduleRun(join(directory, fileName));
            }
        });
    }
} else if (!run()) {
    process.exitCode = 1;
}
