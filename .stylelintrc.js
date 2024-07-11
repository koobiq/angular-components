// @ts-check

/**
 * @see https://stylelint.io/user-guide/configure
 * @type {import('stylelint').Config}
 */
const config = {
    defaultSeverity: 'error',
    allowEmptyInput: true,
    extends: [
        'stylelint-config-recommended-scss',
        'stylelint-prettier/recommended'
    ],
    ignoreFiles: [
        '**/dist/**',
        '**/node_modules/**',
    ],
    rules: {
        'rule-empty-line-before': [
			'always-multi-line',
			{
				except: ['first-nested'],
				ignore: ['after-comment'],
			},
		],
        'no-unknown-custom-properties': true,
        'no-descending-specificity': null,
        'selector-type-no-unknown': [
			true,
			{
				ignore: ['custom-elements'],
                ignoreTypes: ['app'],
			},
		],
        'font-family-no-missing-generic-family-keyword': [
            true,
            {
                ignoreFontFamilies: [
                    'Inter',
                    'PT Mosaic Icons',
                    'JetBrains Mono'
                ],
            }
        ],
    }
};

module.exports = config;
