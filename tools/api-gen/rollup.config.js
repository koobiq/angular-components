const typescript = require('@rollup/plugin-typescript');
const { join } = require('path');

module.exports = {
    input: join(__dirname, './generate-api-docs.ts'),
    output: {
        dir: 'dist/api-gen',
        format: 'module',
        entryFileNames: '[name].mjs'
    },
    external: [
        'chalk',
        '@angular/compiler-cli',
        'path',
        'typescript',
        'fs',
        'fs/promises',
        'glob',
        'marked',
        'nunjucks',
        'highlight.js'
    ],
    plugins: [
        typescript({ tsconfig: join(__dirname, './tsconfig.rollup.json') })
    ]
};
