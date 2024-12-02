const { BASE_PATH } = require('./config');

module.exports = {
    source: [`${BASE_PATH}/properties/colors.json5`, `${BASE_PATH}/properties/palette.json5`],
    platforms: {
        css: {
            buildPath: `docs/guides/`,
            transformGroup: 'kbq/css',
            files: [
                {
                    filter: (token) => !token.attributes.palette && !token.attributes.category.includes('palette'),
                    destination: 'colors.tmp.md',
                    format: 'kbq-vars/docs',
                    prefix: 'kbq'
                }
            ],
            options: {
                outputReferences: true
            }
        }
    }
};
