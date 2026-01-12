// @ts-check

const { readdirSync } = require('fs');
const { resolve } = require('path');

const makeScopeTypesByPath = (path) => {
    const files = readdirSync(resolve(__dirname, path), { withFileTypes: true });
    const directories = files.filter((file) => file.isDirectory());

    return directories.map((dir) => dir.name);
};

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'header-max-length': [2, 'always', 120],
        'scope-enum': [
            2,
            'always',
            [
                ...makeScopeTypesByPath(resolve(__dirname, 'apps')),
                ...makeScopeTypesByPath(resolve(__dirname, 'packages/components')),

                // packages
                'angular-luxon-adapter',
                'angular-moment-adapter',
                'cdk',
                'cli',
                'experimental',
                'schematics',
                'dev',
                'e2e',
                'examples',

                // data-grid
                'ag-grid',

                // core
                'common',
                'formatter',
                'layout',
                'overlay',
                'typography',
                'styles',
                'option',
                'pop-up',

                // others
                'security',
                'visual',

                // Dependabot scopes
                'deps',
                'deps-dev'
            ]
        ]
    }
};

module.exports = config;
