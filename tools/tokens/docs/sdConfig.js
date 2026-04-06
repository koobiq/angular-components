const { BASE_PATH, BUILD_PATH } = require('./config');

module.exports = {
    source: [
        `${BASE_PATH}/properties/!(colors|shadows).json5`,
        `${BASE_PATH}/tokens-new/*.json5`
    ],
    platforms: {
        css: {
            buildPath: BUILD_PATH,
            transformGroup: 'kbq/css-extended',
            files: [
                {
                    filter: (token) => token.attributes.category === 'typography',
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
