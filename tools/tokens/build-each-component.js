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

const componentsWithCss = [
    'alert',
    'autocomplete',
    'badge',
    'button',
    'button-toggle',
    'checkbox',
    'code-block',
    'datepicker',
    'description-list',
    'divider',
    'dropdown',
    'empty-state',
    'file-upload',
    'form-field',
    'hint',
    'icon',
    'icon-button',
    'icon-item',
    'input',
    'link',
    'list',
    'loader-overlay',
    'modal',
    'markdown',
    'navbar',
    'popover',
    'progress-bar',
    'progress-spinner',
    'radio',
    'risk-level',
    'select',
    'sidepanel',
    'scrollbars',
    'forms',
    'option',
    'splitter',
    'tabs',
    'tag',
    'tabs',
    'table',
    'textarea',
    'timezone',
    'toast',
    'toggle',
    'tooltip',
    'tree',
    'tree-select'
];

const args = (process.argv.slice(2).length && process.argv.slice(2)) || componentsWithCss;

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
            (token) => !['light', 'dark'].includes(token.attributes.category) || additionalFilter(token, component)
        );

        // formatting function expects dictionary as input, so here initialize a copy to work with different tokens
        const rootDictionary = filterTokens(
            dictionary,
            (token) => token.attributes.font && token.name.includes('font-family')
        );
        const referencedDictionary = {
            ...rootDictionary,
            allTokens: rootDictionary.allTokens.flatMap((token) => rootDictionary.getReferences(token.original.value)),
            allProperties: rootDictionary.allTokens.flatMap((token) =>
                rootDictionary.getReferences(token.original.value)
            )
        };
        referencedDictionary.allTokens = referencedDictionary.allProperties = [
            ...new Set(referencedDictionary.allTokens)];

        const baseDictionary = filterTokens(
            dictionary,
            (token) =>
                [token.attributes.type, token.attributes.category, token.attributes.item].some(
                    (attr) => attr === 'size'
                ) ||
                (token.attributes.font && !token.name.includes('font-family')) ||
                token.attributes.category === 'typography'
        );
        const lightDictionary = filterTokens(dictionary, (token) => token.attributes.light);
        const darkDictionary = filterTokens(dictionary, (token) => token.attributes.dark);

        const sizesAndRefsTokens = !(baseDictionary.allTokens.length || rootDictionary.allTokens.length)
            ? ''
            : `.kbq-${resolveComponentName(component)} {\n` +
              [
                  dictionaryMapper(baseDictionary, outputReferences),
                  dictionaryMapper(rootDictionary, true)]
                  .filter(Boolean)
                  .join('\n') +
              `\n}\n`;

        const coreTokens = Object.entries({
            [':root']: referencedDictionary,
            [lightThemeSelector]: lightDictionary,
            [darkThemeSelector]: darkDictionary
        })
            .filter(([, currentDictionary]) => currentDictionary.allTokens.length)
            .map(([key, currentDictionary]) => {
                return `${key} {\n` + dictionaryMapper(currentDictionary, outputReferences) + `\n}\n`;
            });

        return [sizesAndRefsTokens, ...coreTokens].filter(Boolean).join('\n');
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
    const files = args.map((component) => `${component}.${TOKEN_FILE_EXT}`);

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
