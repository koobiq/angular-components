// @ts-check

/**
 * @see https://prettier.io/docs/en/options
 * @type {import("prettier").Config}
 */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    overrides: [
        {
            files: ['*.css', '*.scss'],
            options: {
                printWidth: 250,
            }
        },
        {
            files: ['.component.html', '.page.html'],
            options: {
                parser: 'angular'
            }
        },
        {
            files: ['*.html'],
            options: {
                parser: 'html',
                singleQuote: false
            }
        }
    ],
    plugins: ['@ianvs/prettier-plugin-sort-imports'],
    importOrderParserPlugins: ['typescript', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrder: [
        '<BUILTIN_MODULES>',
        '',
        '^@angular/(.*)$',
        '^rxjs(.*)$',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '^[./]',
        ''
    ]
};

module.exports = config;
