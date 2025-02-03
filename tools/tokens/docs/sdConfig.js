const { BASE_PATH, BUILD_PATH } = require('./config');

module.exports = {
    source: [`${BASE_PATH}/properties/*.json5`],
    platforms: {
        html: {
            buildPath: 'packages/docs-examples/components/',
            transformGroup: 'kbq/css-extended',
            files: [
                {
                    filter: (token) => token.attributes.category === 'typography',
                    destination: 'typography/typography-overview/typography-overview-example.html',
                    format: 'example/typography',
                    prefix: 'kbq'
                }
            ]
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
                    destination: 'colors.md',
                    format: 'docs/colors',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'palette',
                    destination: 'palette.md',
                    format: 'docs/palette',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'typography',
                    destination: 'tokens-typography.md',
                    format: 'docs/typography',
                    prefix: 'kbq'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'size' && !token.attributes.type.includes('border-radius'),
                    destination: 'sizes.md',
                    format: 'docs/globals',
                    prefix: 'kbq'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'size' && token.attributes.type.includes('border-radius'),
                    destination: 'border-radius.md',
                    format: 'docs/border-radius',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'shadow',
                    destination: 'shadows.md',
                    format: 'docs/shadows',
                    prefix: 'kbq'
                }
            ],
            options: {
                outputReferences: true
            }
        }
    }
};
