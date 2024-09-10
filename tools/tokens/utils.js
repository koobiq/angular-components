const { unwrapObjectTransformer } = require('@koobiq/tokens-builder/formats/utils.js');
const { formatHelpers } = require('style-dictionary');

// provide additional tokens for component
const filter = {
    autocomplete: 'select-panel-dropdown',
    button: 'kbq-states-focused-color',
    'pseudo-checkbox': 'checkbox',
    datepicker: 'states-foreground-disabled'
};

const componentNameMapping = {
    autocomplete: 'autocomplete-panel',
    'button-toggle': 'button-toggle-group',
    datepicker: 'datepicker__content'
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
    ]
};

const resolvePath = (componentName) =>
    componentAliases[componentName] || `${componentName}/${componentName}-tokens.scss`;

const resolveComponentName = (componentName) => componentNameMapping[componentName] || componentName;

const additionalFilter = (token, componentName) =>
    token.name.replace(/(light|dark)-/, '').includes(filter[componentName]);

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
