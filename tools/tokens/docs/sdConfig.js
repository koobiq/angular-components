const { BASE_PATH, BUILD_PATH } = require('./config');

module.exports = {
    source: [`${BASE_PATH}/properties/*.json5`],
    platforms: {
        css: {
            buildPath: BUILD_PATH,
            transformGroup: 'kbq/css',
            files: [
                {
                    filter: (token) =>
                        ['light', 'dark'].includes(token.attributes.category) &&
                        token.attributes.item !== 'palette' &&
                        !token.attributes.category.includes('palette'),
                    fileHeader: ['### Colors'],
                    destination: 'colors.md',
                    format: 'docs/colors',
                    prefix: 'kbq'
                },
                {
                    filter: (token) => token.attributes.category === 'typography',
                    destination: 'typography.md',
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
