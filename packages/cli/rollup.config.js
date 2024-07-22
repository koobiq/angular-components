const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const resolve = require('@rollup/plugin-node-resolve').default;
const { terser } = require('rollup-plugin-terser');
const path = require('path');
const pckg = require('./package.json');

const getRootPath = (root) => path.resolve(__dirname, '.', root, '.');

const onwarn = (warning, warn) => {
    // typescript tslib
    if (warning.code === 'THIS_IS_UNDEFINED') return;

    warn(warning);
};

const external = [
    // node built-in
    'path',
    'fs',
    'child_process',
    'os',
    'url',
    'assert',
    'inspector',
    'module',
    'events',
    'buffer',
    'string_decoder',
    'perf_hooks',
    'glob',
    'punycode',
    // vscode
    'vscode',
    'chalk',
    'conventional-changelog',
    'conventional-changelog-core',
    'conventional-changelog-angular'
];

const createPlugins = (tsconfig) => [
    json(),
    resolve(),
    commonjs(),
    typescript({ tsconfig, tsconfigOverride: { compilerOptions: { module: 'esnext' } } }),
    terser()
];

module.exports = {
    input: getRootPath('src/cli.ts'),
    output: { file: getRootPath(pckg.main), name: pckg.name, format: 'cjs', sourcemap: true },
    onwarn,
    external: [...external],
    watch: {
        include: getRootPath('**')
    },
    plugins: createPlugins(getRootPath('tsconfig.json'))
};
