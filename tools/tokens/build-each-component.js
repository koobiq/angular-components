require('@koobiq/tokens-builder/build');
const fs = require('fs/promises');
const path = require('path');
const StyleDictionary = require('style-dictionary');
const { formatHelpers } = require('style-dictionary');
const { applyCustomTransformations } = require('@koobiq/tokens-builder/formats/utils.js');

const TOKEN_FILE_EXT = 'json5';
const BASE_PATH = 'node_modules/@koobiq/design-tokens/web';
const fileHeader = '// stylelint-disable no-unknown-custom-properties';

const sdConfig = {
    source: [`${BASE_PATH}/properties/**/*.json5`, `${BASE_PATH}/components/**/*.json5`],
    platforms: {
        css: {
            buildPath: `packages/components/`,
            transformGroup: 'kbq/css',
            filter: (token) => !['font', 'size', 'typography', 'md-typography'].includes(token.attributes.category),
            options: {
                outputReferences: true
            }
        }
    }
};

const dictionaryMapper = (dictionary, outputReferences) => {
    const formatProperty = formatHelpers.createPropertyFormatter({ outputReferences, dictionary, format: 'css' });
    return dictionary.allTokens.map(formatProperty).join('\n');
};

StyleDictionary.registerFormat({
    name: 'kbq-css/component',
    formatter: function ({ dictionary, options = {} }) {
        const { outputReferences, selector = ':root', darkThemeSelector = '.kbq-dark' } = options;

        const allTokens = applyCustomTransformations(dictionary);

        dictionary.allTokens.forEach((token) => {
            token.name = token.name.replace(/(light|dark)-/, '');
        });
        dictionary.allTokens = dictionary.allProperties = allTokens.filter(
            (token) => !['light', 'dark'].includes(token.attributes.category)
        );

        // formatting function expects dictionary as input, so here initialize a copy to work with different tokens
        const baseDictionary = { ...dictionary };
        const darkDictionary = { ...dictionary };

        baseDictionary.allTokens = baseDictionary.allProperties = baseDictionary.allTokens.filter(
            (token) => token.attributes.light || token.attributes.type === 'size' || token.attributes.font
        );
        darkDictionary.allTokens = darkDictionary.allProperties = darkDictionary.allTokens.filter(
            (token) => token.attributes.dark
        );

        return (
            `${fileHeader}\n` +
            Object.entries({
                [selector]: baseDictionary,
                [darkThemeSelector]: darkDictionary
            })
                .map(([key, currentDictionary]) => {
                    return `${key} {\n` + dictionaryMapper(currentDictionary, outputReferences) + `\n}\n`;
                })
                .join('\n')
        );
    }
});

const main = async () => {
    const files = await fs.readdir(
        path.join(process.cwd(), 'node_modules', '@koobiq', 'design-tokens', 'web', 'components'),
        {
            encoding: 'utf8'
        }
    );

    sdConfig.platforms.css.files = files
        .filter((file) => path.extname(file).includes(TOKEN_FILE_EXT))
        .map((currentValue) => {
            const component = path.basename(currentValue, `.${TOKEN_FILE_EXT}`);
            return {
                destination: `${component}/${component}-tokens.scss`,
                filter: (token) =>
                    token.attributes.category?.includes(path.basename(currentValue, `.${TOKEN_FILE_EXT}`)) ||
                    path.basename(currentValue, `.${TOKEN_FILE_EXT}`).includes(token.attributes.category) ||
                    // give access to light/dark/palette tokens to resolve reference manually
                    ['light', 'dark', 'palette'].includes(token.attributes.category),
                format: 'kbq-css/component',
                prefix: 'kbq'
            };
        });

    StyleDictionary.extend(sdConfig).buildAllPlatforms();
};
main();
