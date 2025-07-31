// @ts-check

/** @type {import('prettier').Options} */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    htmlWhitespaceSensitivity: 'ignore',
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
            files: ['*.xml'],
            options: {
                parser: 'xml',
                plugins: ['@prettier/plugin-xml']
            }
        },
        {
            files: ['*.html'],
            excludeFiles: ['index.html'],
            options: {
                parser: 'angular'
            }
        }
    ]
};

module.exports = config;
