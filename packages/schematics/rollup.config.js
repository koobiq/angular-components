const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');

const path = require('path');
const { promises: fs } = require('fs');

const pkg = require('../../package.json');
const { getMigrations } = require('./src/utils/migrations');

const version = (str) => JSON.stringify(str.startsWith('^') ? str : '^' + str);

const distDir = path.join(__dirname, 'dist');

const clean = () => ({
    async buildStart() {
        await fs.rm(distDir, { force: true, recursive: true });
    }
});

module.exports = [
    {
        output: {
            dir: distDir,
            format: 'cjs',
            exports: 'named'
        },
        input: {
            'ng-add/index': path.join(__dirname, 'src/ng-add/index.ts'),
            'utils/package-config': path.join(__dirname, 'src/utils/package-config.ts'),
            'utils/messages': path.join(__dirname, 'src/utils/messages.ts'),
            ...getMigrations().reduce((res, cur) => {
                res[`migrations/${cur}/index`] = path.join(__dirname, `src/migrations/${cur}/index.ts`);
                res[`migrations/${cur}/data`] = path.join(__dirname, `src/migrations/${cur}/data.ts`);
                return res;
            }, {})
            //'ng-add/setup-project': path.join(__dirname, 'ng-add/setup-project.ts'),
        },
        external: (dependency) =>
            !(dependency.startsWith('./') || dependency.startsWith('../') || dependency.startsWith(__dirname)),
        plugins: [
            clean(),
            replace({
                preventAssignment: true,
                'VERSIONS.ANGULAR_CDK': version(pkg.dependencies['@angular/cdk']),
                'VERSIONS.KOOBIQ_CDK': version(pkg.version),
                'VERSIONS.KOOBIQ_ANGULAR_LUXON_ADAPTER': version(pkg.version),
                'VERSIONS.KOOBIQ_DATE_FORMATTER': version(pkg.dependencies['@koobiq/date-formatter']),
                'VERSIONS.KOOBIQ_DATE_ADAPTER': version(pkg.dependencies['@koobiq/date-adapter']),
                'VERSIONS.KOOBIQ_TOKENS_BUILDER': version(pkg.devDependencies['@koobiq/tokens-builder']),
                'VERSIONS.KOOBIQ_DESIGN_TOKENS': version(pkg.devDependencies['@koobiq/design-tokens']),
                'VERSIONS.KOOBIQ_ICONS': version(pkg.dependencies['@koobiq/icons']),
                'VERSIONS.MESSAGEFORMAT_CORE': version(pkg.devDependencies['@messageformat/core']),
                'VERSIONS.LUXON': version(pkg.devDependencies.luxon),
                'VERSIONS.NGX_HIGHLIGHTJS': version(pkg.devDependencies['ngx-highlightjs'])
            }),
            typescript({
                tsconfig: path.join(__dirname, 'tsconfig.rollup.json')
            })

        ]
    }
];
