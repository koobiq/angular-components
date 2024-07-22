// @ts-check

/**
 * @type {import('prettier').Options}
 */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    plugins: [
        'prettier-plugin-organize-imports',
        // should be last
        'prettier-plugin-multiline-arrays'
    ],
    overrides: [
        {
            files: ['*.yml'],
            options: {
                tabWidth: 2
            }
        },
        {
            files: [
                '.component.html',
                '.page.html'
            ],
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
    ]
};

module.exports = config;
