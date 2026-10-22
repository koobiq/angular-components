import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import ts from 'typescript';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;
const isCI = !!process.env['CI'];

// Parsed by TypeScript because a tsconfig is JSONC: a comment or a trailing comma would break `JSON.parse`.
const tsconfig = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);

if (tsconfig.error) {
    throw new Error(
        ts.formatDiagnostic(tsconfig.error, {
            getCanonicalFileName: (fileName: string) => fileName,
            getCurrentDirectory: () => root,
            getNewLine: () => '\n'
        })
    );
}

/** The `paths` of the root tsconfig, so specs import entry points by name the way the library does. */
const tsconfigPaths: Record<string, string[]> = tsconfig.config.compilerOptions.paths;

// Exact-match aliases: a prefix match would send `@koobiq/components/scrollbar/deprecated` to the
// `scrollbar` entry point.
const alias = Object.entries(tsconfigPaths).map(([key, [target]]) =>
    key.endsWith('/*')
        ? {
              find: new RegExp(`^${key.slice(0, -2)}/(.*)$`),
              replacement: resolve(root, target.slice(0, -2)) + '/$1'
          }
        : { find: new RegExp(`^${key}$`), replacement: resolve(root, target) }
);

// `@koobiq/luxon-date-adapter` reaches luxon through `require()`, which loads its CommonJS build; an ES import
// would load the ES build as a second copy, with `Settings.defaultZone` of its own.
const luxon = { find: /^luxon$/, replacement: resolve(root, 'node_modules/luxon/build/node/luxon.js') };

const shared = {
    globals: true,
    // The first test of a file pays the file's cold start (the first render, a TypeScript program for a
    // schematic), which takes 3-7 s on a machine busy with other work, such as a Docker e2e run. Locally
    // that is noise; on the dedicated CI runner it has never fired, so the tight limit stays there and
    // still flags a test that has become slow.
    testTimeout: isCI ? 2000 : 10_000,
    clearMocks: true,
    silent: isCI,
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**']
};

export default defineConfig({
    resolve: { alias },
    test: {
        // A configured reporter replaces the `github-actions` one Vitest adds by default, which annotates the pull
        // request with the failed tests.
        reporters: isCI
            ? ['dot', ...(process.env['GITHUB_ACTIONS'] === 'true' ? ['github-actions' as const] : [])]
            : ['default'],
        projects: [
            {
                plugins: [angular({ tsconfig: resolve(root, 'tsconfig.spec.json'), workspaceRoot: root })],
                resolve: { alias: [...alias, luxon] },
                test: {
                    ...shared,
                    name: 'angular',
                    // A VM context per spec file, so the global object is jsdom's `window`. In
                    // child processes rather than the `vmThreads` the Angular plugin defaults to: one process
                    // holding every worker starves under load and times tests out.
                    pool: 'vmForks',
                    environment: 'jsdom',
                    // The document URL the snapshots of resolved links carry.
                    environmentOptions: { jsdom: { url: 'http://localhost/' } },
                    include: [
                        'packages/components/**/*.spec.ts',
                        'packages/components-experimental/**/*.spec.ts',
                        'packages/angular-luxon-adapter/**/*.spec.ts',
                        'packages/angular-moment-adapter/**/*.spec.ts',
                        'apps/docs/**/*.spec.ts',
                        // Prove the console hook and the axe-core matcher of this project's setup, as the node project
                        // does for its own console hook.
                        'tools/vitest/fail-on-console.spec.ts',
                        'tools/vitest/to-have-no-violations.spec.ts'
                    ],
                    setupFiles: ['tools/vitest/setup-angular.ts']
                }
            },
            {
                resolve: { alias },
                test: {
                    ...shared,
                    name: 'node',
                    environment: 'node',
                    include: [
                        'packages/schematics/**/*.spec.ts',
                        'packages/cli/**/*.spec.ts',
                        'tools/**/*.spec.ts'
                    ],
                    exclude: [
                        '**/node_modules/**',
                        // A separate npm project with its own Angular and its own runner.
                        'tools/check-angular/**',
                        // Needs the document and the matcher of the angular project's setup.
                        'tools/vitest/to-have-no-violations.spec.ts'
                    ],
                    setupFiles: ['tools/vitest/setup-node.ts']
                }
            }
        ]
    }
});
