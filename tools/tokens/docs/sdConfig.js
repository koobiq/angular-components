const { BASE_PATH, BUILD_PATH } = require('./config');

module.exports = {
    source: [`${BASE_PATH}/properties/*.json5`],
    platforms: {
        html: {
            buildPath: 'packages/components/core/styles/typography/',
            transformGroup: 'kbq/css-extended',
            files: [
                {
                    filter: (token) => token.attributes.category === 'typography',
                    destination: 'tmp.typography.html',
                    format: 'docs/typography',
                    prefix: 'kbq'
                }
            ],
            actions: ['insert_table']
        },
        css: {
            buildPath: BUILD_PATH,
            transformGroup: 'kbq/css-extended',
            files: [
                {
                    filter: (token) =>
                        ['light', 'dark'].includes(token.attributes.category) &&
                        token.attributes.item !== 'palette' &&
                        !token.attributes.category.includes('palette'),
                    destination: 'colors.ts',
                    format: 'docs/colors-ts',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'palette',
                    destination: 'palette.ts',
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
                    filter: (token) => token.attributes.category === 'shadow',
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
