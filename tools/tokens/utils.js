const { unwrapObjectTransformer } = require('@koobiq/tokens-builder/formats/utils.js');
const { formatHelpers } = require('style-dictionary');

// provide additional tokens for component
const filter = {
    autocomplete: 'select-panel-dropdown',
    button: 'kbq-states-focused-color',
    'code-block': 'kbq-states-focused-color',
    'pseudo-checkbox': 'checkbox',
    datepicker: 'states-foreground-disabled',
    dropdown: ['kbq-list', 'foreground-contrast-secondary'],
    'icon-button': 'states-focused-color',
    toggle: 'foreground-text-disabled'
};

const componentNameMapping = {
    autocomplete: 'autocomplete-panel',
    'button-toggle': 'button-toggle-group',
    datepicker: 'datepicker__content',
    dropdown: 'dropdown__panel'
};

const applyCustomTransformations = (dictionary) => {
    dictionary.allProperties = dictionary.allTokens = dictionary.allTokens.flatMap((token) => {
        if (typeof token.value === 'object' && token.type === 'font') {
            return unwrapObjectTransformer(token);
        }
        return token;
    });

    return dictionary.allTokens;
};

const componentAliases = {
    checkbox: [
        { path: 'checkbox/checkbox-tokens.scss', aliasName: 'checkbox' },
        { path: 'core/selection/pseudo-checkbox/pseudo-checkbox-tokens.scss', aliasName: 'pseudo-checkbox' }
    ],
    hint: 'form-field/hint-tokens.scss',
    'icon-button': 'icon/icon-button-tokens.scss',
    'icon-item': 'icon/icon-item-tokens.scss'
};

const resolvePath = (componentName) =>
    componentAliases[componentName] || `${componentName}/${componentName}-tokens.scss`;

const resolveComponentName = (componentName) => componentNameMapping[componentName] || componentName;

const additionalFilter = (token, componentName) => {
    const filters = filter[componentName];
    const themeAgnosticTokenName = token.name.replace(/(light|dark)-/, '');
    if (Array.isArray(filters)) {
        return filters.some((filter) => themeAgnosticTokenName.includes(filter));
    }
    return themeAgnosticTokenName.includes(filter[componentName]);
};

const dictionaryMapper = (dictionary, outputReferences) => {
    const formatProperty = formatHelpers.createPropertyFormatter({ outputReferences, dictionary, format: 'css' });
    return '  ' + dictionary.allTokens.map(formatProperty).join('\n  ');
};

const filterTokens = (dictionary, predicate) => {
    const filteredTokens = dictionary.allTokens.filter(predicate);
    return { ...dictionary, allTokens: filteredTokens, allProperties: filteredTokens };
};

module.exports = {
    applyCustomTransformations,
    resolvePath,
    resolveComponentName,
    additionalFilter,
    dictionaryMapper,
    filterTokens
};
