require('@koobiq/tokens-builder/build');
const path = require('path');
const StyleDictionary = require('style-dictionary');
const { formatHelpers } = require('style-dictionary');
const { applyCustomTransformations } = require('@koobiq/tokens-builder/formats/utils.js');

const TOKEN_FILE_EXT = 'json5';
const BASE_PATH = 'node_modules/@koobiq/design-tokens/web';

// FIXME: resolve path for components where the name of token file and name of the folder in the components are different (#DS-2788)
const resolvePath = (componentName) => `${componentName}/${componentName}-tokens.scss`;

const styleDictionaryConfig = {
    source: [`${BASE_PATH}/properties/**/*.json5`, `${BASE_PATH}/components/**/alert.json5`],
    platforms: {
        css: {
            buildPath: `packages/components/`,
            transformGroup: 'kbq/css',
            filter: (token) => !['font', 'size', 'typography', 'md-typography'].includes(token.attributes.category)
            // FIXME: add when move all components to css vars (#DS-2788)
            /*options: {
                outputReferences: true
            }*/
        }
    }
};

const dictionaryMapper = (dictionary, outputReferences) => {
    const formatProperty = formatHelpers.createPropertyFormatter({ outputReferences, dictionary, format: 'css' });
    return dictionary.allTokens.map(formatProperty).join('\n');
};

const filterTokens = (dictionary, predicate) => {
    const filteredTokens = dictionary.allTokens.filter(predicate);
    return { ...dictionary, allTokens: filteredTokens, allProperties: filteredTokens };
};

StyleDictionary.registerFormat({
    name: 'kbq-css/component',
    formatter: function ({ dictionary, options = {} }) {
        const {
            outputReferences,
            component,
            lightThemeSelector = ':where(.kbq-light, .theme-light, .kbq-theme-light)',
            darkThemeSelector = ':where(.kbq-dark, .theme-dark, .kbq-theme-dark)'
        } = options;

        const allTokens = applyCustomTransformations(dictionary);

        dictionary.allTokens.forEach((token) => {
            token.name = token.name.replace(/(light|dark)-/, '');
        });
        dictionary.allTokens = dictionary.allProperties = allTokens.filter(
            (token) => !['light', 'dark'].includes(token.attributes.category)
        );

        // formatting function expects dictionary as input, so here initialize a copy to work with different tokens
        const baseDictionary = filterTokens(
            dictionary,
            (token) => token.attributes.type === 'size' || token.attributes.font
        );
        const lightDictionary = filterTokens(dictionary, (token) => token.attributes.light);
        const darkDictionary = filterTokens(dictionary, (token) => token.attributes.dark);

        return Object.entries({
            [`.kbq-${component}`]: baseDictionary,
            [lightThemeSelector]: lightDictionary,
            [darkThemeSelector]: darkDictionary
        })
            .map(([key, currentDictionary]) => {
                return `${key} {\n` + dictionaryMapper(currentDictionary, outputReferences) + `\n}\n`;
            })
            .join('\n');
    }
});

const main = async () => {
    const files = [`alert.${TOKEN_FILE_EXT}`];

    styleDictionaryConfig.platforms.css.files = files
        .filter((file) => path.extname(file).includes(TOKEN_FILE_EXT))
        .map((currentValue) => {
            const component = path.basename(currentValue, `.${TOKEN_FILE_EXT}`);
            return {
                destination: resolvePath(component),
                filter: (token) =>
                    token.attributes.category?.includes(path.basename(currentValue, `.${TOKEN_FILE_EXT}`)) ||
                    path.basename(currentValue, `.${TOKEN_FILE_EXT}`).includes(token.attributes.category) ||
                    // give access to light/dark/palette tokens to resolve reference manually
                    ['light', 'dark', 'palette'].includes(token.attributes.category),
                format: 'kbq-css/component',
                prefix: 'kbq',
                options: {
                    component
                }
            };
        });

    StyleDictionary.extend(styleDictionaryConfig).buildPlatform('css');
};
main();
