// @ts-check

/** @type {import('cspell').CSpellSettings} */
const config = {
    version: '0.2',
    useGitignore: true,
    enableGlobDot: true,
    readonly: true,
    ignorePaths: [
        '**/dist/**',
        '**/node_modules/**',
        '**/CHANGELOG.md',
        '**/public_api_guard/**',
        // Bilingual code-review documents: prose in two languages, quoting code identifiers verbatim.
        'docs/review/**'
    ],
    import: [
        'tools/cspell-locales/en.json',
        'tools/cspell-locales/ru.json'
    ],
    dictionaries: [
        'fonts',
        'fullstack',
        'markdown',
        'software-terms'
    ]
};

module.exports = config;
