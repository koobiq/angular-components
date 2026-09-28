const { BASE_PATH, BUILD_PATH } = require('./config');

// The typography table lists the global `kbq-<level>` classes of `kbq-base-typography()`, and these levels have none:
// `navbar-title` and `mono-codeblock` style the navbar brand and the code block, `mono-normal-medium` is the base of
// the markdown inline code inside a link. A global `.kbq-navbar-title` is not an option: the navbar styles its item
// titles with a rule of that very selector, and which of the two wins would depend on the order of the stylesheets.
const TYPOGRAPHY_LEVELS_WITHOUT_CLASS = ['navbar-title', 'mono-codeblock', 'mono-normal-medium'];

module.exports = {
    source: [`${BASE_PATH}/properties/!(colors.v1|shadows.v1).json5`],
    platforms: {
        css: {
            buildPath: BUILD_PATH,
            transformGroup: 'kbq/css-extended',
            files: [
                {
                    filter: (token) =>
                        token.attributes.category === 'typography' &&
                        !TYPOGRAPHY_LEVELS_WITHOUT_CLASS.includes(token.attributes.type),
                    destination: 'typography.ts',
                    format: 'docs/typography-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'light' &&
                        token.attributes.item !== 'palette' &&
                        !token.attributes.category.includes('plt') &&
                        !token.deprecated,
                    destination: 'colors.ts',
                    format: 'docs/colors-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'plt',
                    destination: 'palette.ts',
                    format: 'docs/palette-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'semantic',
                    destination: 'semantic.ts',
                    format: 'docs/palette-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'size' && !token.attributes.type.includes('border-radius'),
                    destination: 'sizes.ts',
                    format: 'docs/globals-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'size' && token.attributes.type.includes('border-radius'),
                    destination: 'border-radius.ts',
                    format: 'docs/border-radius-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'shadow' && token.attributes.type === 'light',
                    destination: 'shadows.ts',
                    format: 'docs/shadows-ts',
                    prefix: 'kbq'
                }
            ],
            options: {
                outputReferences: true
            }
        }
    }
};
