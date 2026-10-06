import angular from '@analogjs/vite-plugin-angular';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;
const isCI = !!process.env['CI'];

/** The `paths` of the root tsconfig, so specs import entry points by name the way the library does. */
const tsconfigPaths: Record<string, string[]> = JSON.parse(readFileSync(resolve(root, 'tsconfig.json'), 'utf8'))
    .compilerOptions.paths;

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
    testTimeout: 2000,
    clearMocks: true,
    silent: isCI,
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**']
};

export default defineConfig({
    resolve: { alias },
    test: {
        reporters: isCI ? ['dot'] : ['default'],
        projects: [
            {
                plugins: [angular({ tsconfig: resolve(root, 'tsconfig.spec.json'), workspaceRoot: root })],
                resolve: { alias: [...alias, luxon] },
                test: {
                    ...shared,
                    name: 'angular',
                    // A VM context per spec file, so the global object is jsdom's `window` as it was under Jest. In
                    // child processes rather than the `vmThreads` the Angular plugin defaults to: one process
                    // holding every worker starves under load and times tests out.
                    pool: 'vmForks',
                    environment: 'jsdom',
                    // Jest's default document URL, which the snapshots of resolved links carry.
                    environmentOptions: { jsdom: { url: 'http://localhost/' } },
                    include: [
                        'packages/components/**/*.spec.ts',
                        'packages/components-experimental/**/*.spec.ts',
                        'packages/angular-luxon-adapter/**/*.spec.ts',
                        'packages/angular-moment-adapter/**/*.spec.ts',
                        'apps/docs/**/*.spec.ts',
                        // Proves the console hook of this project's setup, as the node project does for its own.
                        'tools/vitest/fail-on-console.spec.ts'
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
                    setupFiles: ['tools/vitest/setup-node.ts']
                }
            }
        ]
    }
});
