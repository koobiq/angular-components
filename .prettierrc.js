// @ts-check

const plugins = [
    'prettier-plugin-organize-imports',
    'prettier-plugin-sh',
    // should be last
    'prettier-plugin-multiline-arrays'
];

/** @type {import('prettier').Options} */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    htmlWhitespaceSensitivity: 'ignore',
    plugins,
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
        },
        {
            files: ['llms.txt'],
            options: {
                parser: 'markdown'
            }
        },
        {
            // Shell snippets in the docs carry placeholders like `<your project>`, which the sh parser reads as redirects
            files: ['*.md', '*.mdx'],
            options: {
                plugins: plugins.filter((plugin) => plugin !== 'prettier-plugin-sh')
            }
        }
    ]
};

module.exports = config;
