/**
 * Removes what the builds and the test runs leave behind, so that the next build starts from nothing:
 * `yarn run clean`. A cache with a command of its own gets a line in `COMMANDS`, an output a line in `PATHS`.
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';

const projectRoot = join(__dirname, '..');

/** CLIs of installed packages, run with the current Node binary, so nothing depends on what is on PATH. */
const COMMANDS: { name: string; packageName: string; bin: string; args: string[] }[] = [
    // The TypeScript transform cache Playwright keeps outside the repository, in the system temp folder.
    { name: 'playwright clear-cache', packageName: '@playwright/test', bin: 'playwright', args: ['clear-cache'] },
    // The Angular CLI cache wherever `cli.cache.path` puts it: linker and TypeScript results, the ng-packagr
    // cache of the libraries and the dependencies Vite pre-bundles for the dev server.
    { name: 'ng cache clean', packageName: '@angular/cli', bin: 'ng', args: ['cache', 'clean'] },
    // The Vitest caches: the results that order the next run, in `node_modules/.vite/vitest`, and the module
    // cache of `experimental.fsModuleCache`.
    { name: 'vitest --clearCache', packageName: 'vitest', bin: 'vitest', args: ['--clearCache'] }
];

/** Paths relative to the repository root. */
const PATHS = [
    // Every package and app build.
    'dist',
    // Playwright: the HTML reports of the component and docs suites, the blob reports merged from shards, and
    // the traces and screenshots of failed tests.
    'playwright-report',
    'playwright-report-docs',
    'blob-report',
    'test-results',
    // What the Playwright MCP server saves while an agent drives the browser.
    '.playwright-mcp'
];

/** The file a package declares as its CLI: packages such as `vitest` do not export it, only their manifest. */
const resolveBin = (packageName: string, bin: string): string => {
    const manifestPath = require.resolve(`${packageName}/package.json`);
    const manifest: { bin?: string | Record<string, string> } = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const path = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[bin];

    if (!path) throw new Error(`${packageName} declares no \`${bin}\` CLI in its package.json.`);

    return join(dirname(manifestPath), path);
};

for (const { name, packageName, bin, args } of COMMANDS) {
    const { status, error } = spawnSync(process.execPath, [resolveBin(packageName, bin), ...args], {
        cwd: projectRoot,
        stdio: 'inherit'
    });

    if (status !== 0) {
        console.error(`\`${name}\` failed${error ? `: ${error.message}` : ''}, the steps after it were skipped.`);
        process.exit(status ?? 1);
    }

    console.info(`Ran ${name}`);
}

for (const path of PATHS) {
    const target = join(projectRoot, path);

    if (!existsSync(target)) continue;

    rmSync(target, { recursive: true, force: true });
    console.info(`Removed ${path}`);
}
