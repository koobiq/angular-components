const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');

const path = require('path');
const { promises: fs, readdirSync, statSync } = require('fs');

const pkg = require('../../package.json');
const { getMigrations } = require('./src/utils/migrations');

const version = (str) => JSON.stringify(str.startsWith('^') ? str : '^' + str);

const distDir = path.join(__dirname, 'dist');

const clean = () => ({
    async buildStart() {
        await fs.rm(distDir, { force: true, recursive: true });
    }
});

const getMigrationInputs = () => {
    return getMigrations().reduce((res, cur) => {
        res[`migrations/${cur}/index`] = path.join(__dirname, `src/migrations/${cur}/index.ts`);

        const optionalMigrationData = path.join(__dirname, `src/migrations/${cur}/data.ts`);
        const fileExists = statSync(optionalMigrationData, { throwIfNoEntry: false });

        if (fileExists) {
            res[`migrations/${cur}/data`] = optionalMigrationData;
        }

        return res;
    }, {});
};

/**
 * Every util module is an entry of its own, so it ships under a stable name rather than inside a hashed chunk.
 * `.d.ts` and `.spec.ts` files do not match; `testing.ts` holds the spec helpers.
 */
const getUtilInputs = () => {
    const utilsDir = path.join(__dirname, 'src/utils');

    return readdirSync(utilsDir)
        .filter((file) => /^[\w-]+\.ts$/.test(file) && file !== 'testing.ts')
        .reduce((res, file) => {
            res[`utils/${path.basename(file, '.ts')}`] = path.join(utilsDir, file);

            return res;
        }, {});
};

const TEST_IMPORT = /^vitest(\/|$)|\/testing$/;

/** Fails the build when shipped code imports test tooling, e.g. a spec helper that became an entry. */
const rejectTestImports = () => ({
    name: 'reject-test-imports',
    generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
            const testImport =
                chunk.type === 'chunk' &&
                [...chunk.imports, ...chunk.dynamicImports].find((id) => TEST_IMPORT.test(id));

            if (testImport) {
                this.error(`${chunk.fileName} imports ${testImport}, which consumers do not have`);
            }
        }
    }
});

module.exports = [
    {
        output: {
            dir: distDir,
            format: 'cjs',
            exports: 'named',
            // `.cjs` stays CommonJS inside @koobiq/components, which ng-packagr marks `"type": "module"`.
            entryFileNames: '[name].cjs',
            // A module shared by several entries without being one goes next to the utils, which
            // copy-meta-to-dist.js ships as a whole.
            chunkFileNames: 'utils/[name]-[hash].cjs'
        },
        input: {
            'ng-add/index': path.join(__dirname, 'src/ng-add/index.ts'),
            ...getUtilInputs(),
            ...getMigrationInputs()
            //'ng-add/setup-project': path.join(__dirname, 'ng-add/setup-project.ts'),
        },
        external: (dependency) =>
            !(dependency.startsWith('./') || dependency.startsWith('../') || dependency.startsWith(__dirname)),
        plugins: [
            clean(),
            rejectTestImports(),
            replace({
                preventAssignment: true,
                'VERSIONS.ANGULAR_CDK': version(pkg.dependencies['@angular/cdk']),
                'VERSIONS.KOOBIQ_CDK': version(pkg.version),
                'VERSIONS.KOOBIQ_ANGULAR_LUXON_ADAPTER': version(pkg.version),
                'VERSIONS.KOOBIQ_LUXON_DATE_ADAPTER': version(pkg.devDependencies['@koobiq/luxon-date-adapter']),
                'VERSIONS.KOOBIQ_DATE_FORMATTER': version(pkg.dependencies['@koobiq/date-formatter']),
                'VERSIONS.KOOBIQ_DATE_ADAPTER': version(pkg.dependencies['@koobiq/date-adapter']),
                'VERSIONS.KOOBIQ_DESIGN_TOKENS': version(pkg.devDependencies['@koobiq/design-tokens']),
                'VERSIONS.KOOBIQ_ICONS': version(pkg.dependencies['@koobiq/icons']),
                'VERSIONS.LUXON': version(pkg.devDependencies.luxon),
                // The scrollbar relies on a specific `overlayscrollbars` build, so this one is
                // injected exactly as the root manifest pins it — no caret. Widening it here would
                // let `ng add` install a version the design system has never been tested against.
                'VERSIONS.OVERLAYSCROLLBARS': JSON.stringify(pkg.dependencies.overlayscrollbars)
            }),
            typescript({
                tsconfig: path.join(__dirname, 'tsconfig.rollup.json')
            })
        ]
    }
];
