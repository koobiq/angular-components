const { unwrapObjectTransformer } = require('@koobiq/tokens-builder/formats/utils.js');
const { formatHelpers } = require('style-dictionary');

// provide additional tokens for component
const filter = {
    autocomplete: 'select-panel-dropdown',
    button: 'kbq-states-focused-color',
    'code-block': 'kbq-states-focused-color',
    datepicker: 'states-foreground-disabled',
    dropdown: ['kbq-list', 'foreground-contrast-secondary'],
    markdown: ['foreground-contrast', 'background-bg'],
    'empty-state': 'foreground-error',
    'file-upload': ['form-field-hint-text', 'form-field-hint-font-text'],
    'icon-button': 'states-focused-color',
    'pseudo-checkbox': 'checkbox',
    table: ['states-background-transparent-hover', 'line-contrast-less', 'foreground-contrast'],
    toggle: 'foreground-text-disabled',
    'tree-select': [
        'select-panel',
        'kbq-divider-color',
        'foreground-contrast',
        'error-default',
        'foreground-text-disabled'
    ],
    navbar: [
        'states-line-focus-theme',
        'line-contrast-less',
        'typography-text-normal-medium',
        'navbar-item',
        'kbq-size-xxs',
        'kbq-size-xs',
        'kbq-size-s',
        'kbq-size-l',
        'kbq-size-m',
        'kbq-size-xl',
        'kbq-size-xxl',
        'kbq-size-3xl',
        'kbq-size-4xl',
        'kbq-size-5xl'
    ],
    popover: [
        'kbq-size-s',
        'kbq-size-4xl',
        'button-size-border-radius',
        'background-overlay-inverse'
    ],
    radio: 'foreground-contrast',
    select: [
        'kbq-foreground-contrast',
        'kbq-foreground-text-less-contrast',
        'kbq-error-default',
        'foreground-text-disabled',
        'select-panel',
        'kbq-divider-color',
        'kbq-option-size',
        'size-xxs',
        'kbq-size-m'
    ]
};

const componentNameMapping = {
    autocomplete: 'autocomplete-panel',
    'button-toggle': 'button-toggle-group',
    datepicker: 'datepicker__content',
    'description-list': 'dl',
    dropdown: 'dropdown__panel',
    list: 'list, .kbq-list-selection',
    'timezone-option': 'timezone-select__panel',
    tree: ['tree', '.kbq-tree-selection'],
    radio: 'radio-button',
    select: 'select, .kbq-select__panel',
    sidepanel: 'sidepanel-container'
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
    'description-list': 'dl/dl-tokens.scss',
    hint: 'form-field/hint-tokens.scss',
    'icon-button': 'icon/icon-button-tokens.scss',
    'icon-item': 'icon/icon-item-tokens.scss',
    timezone: [{ path: 'timezone/timezone-option-tokens.scss', aliasName: 'timezone-option' }]
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
