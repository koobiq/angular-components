// @ts-check

/**
 * @see https://stylelint.io/user-guide/configure
 * @type {import('stylelint').Config}
 */
const config = {
    defaultSeverity: 'warning',
    extends: [
        'stylelint-config-recommended-scss',
        'stylelint-prettier/recommended'
    ],
    // ignoreFiles: [
    //     '**/dist/**',
    //     '**/node_modules/**',
    // ],
};

module.exports = config;
