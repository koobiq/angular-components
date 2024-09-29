// @ts-check

/** @type {import('stylelint').Config} */
const config = {
    defaultSeverity: 'error',
    allowEmptyInput: true,
    extends: [
        'stylelint-config-recommended-scss',
        // should be last
        'stylelint-prettier/recommended'
    ],
    rules: {
        'rule-empty-line-before': [
            'always-multi-line',
            {
                except: ['first-nested'],
                ignore: ['after-comment']
            }
        ],
        'no-unknown-custom-properties': true,
        'no-descending-specificity': null,
        'selector-type-no-unknown': [
            true,
            {
                ignore: ['custom-elements'],
                ignoreTypes: ['app']
            }
        ],
        'font-family-no-missing-generic-family-keyword': [
            true,
            {
                ignoreFontFamilies: [
                    'Inter',
                    'Koobiq Icons',
                    'JetBrains Mono'
                ]
            }
        ],
        'scss/operator-no-newline-after': null,
        'scss/selector-no-union-class-name': true
    }
};

module.exports = config;
