require('@koobiq/tokens-builder/build');
const path = require('path');
const StyleDictionary = require('style-dictionary');
const {
    applyCustomTransformations,
    resolvePath,
    additionalFilter,
    resolveComponentName,
    filterTokens,
    dictionaryMapper
} = require('./utils');

const TOKEN_FILE_EXT = 'json5';
const BASE_PATH = 'node_modules/@koobiq/design-tokens/web';

const componentsWithCss = ['alert', 'autocomplete', 'badge', 'button', 'button-toggle', 'checkbox'];

const styleDictionaryConfig = {
    source: [`${BASE_PATH}/properties/**/*.json5`, `${BASE_PATH}/components/**/*.json5`],
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
            [`.kbq-${resolveComponentName(component)}`]: baseDictionary,
            [lightThemeSelector]: lightDictionary,
            [darkThemeSelector]: darkDictionary
        })
            .map(([key, currentDictionary]) => {
                return `${key} {\n` + dictionaryMapper(currentDictionary, outputReferences) + `\n}\n`;
            })
            .join('\n');
    }
});

function fileFormat(destination, component) {
    return {
        destination,
        filter: (token) => token.attributes.category === component || additionalFilter(token, component),
        // give access to light/dark/palette tokens to resolve reference manually
        // ['light', 'dark', 'palette'].includes(token.attributes.category),
        format: 'kbq-css/component',
        prefix: 'kbq',
        options: {
            component
        }
    };
}

const main = async () => {
    const files = componentsWithCss.map((component) => `${component}.${TOKEN_FILE_EXT}`);

    styleDictionaryConfig.platforms.css.files = files
        .filter((file) => path.extname(file).includes(TOKEN_FILE_EXT))
        .flatMap((currentValue) => {
            const component = path.basename(currentValue, `.${TOKEN_FILE_EXT}`);
            const destination = resolvePath(component);

            if (Array.isArray(destination)) {
                return destination.map(({ path, aliasName }) => fileFormat(path, aliasName));
            }

            return fileFormat(destination, component);
        });

    StyleDictionary.extend(styleDictionaryConfig).buildPlatform('css');
};
main();
