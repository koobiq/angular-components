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
        // copies of the repository made by Claude Code; git hides them through .git/info/exclude,
        // which useGitignore does not read
        '.claude/worktrees/**'
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
