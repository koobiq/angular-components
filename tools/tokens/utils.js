const { unwrapObjectTransformer } = require('@koobiq/tokens-builder/formats/utils.js');
const { formatHelpers } = require('style-dictionary');

// provide additional tokens for component
const filter = {
    autocomplete: 'select-panel-dropdown',
    dropdown: ['kbq-list'],
    'file-upload': ['form-field-hint-text', 'form-field-hint-font-text'],
    'pseudo-checkbox': 'checkbox',
    'tree-select': ['select-panel'],
    navbar: 'navbar-item',
    popover: [
        'button-size-border-radius'
    ],
    select: [
        'select-panel',
        'kbq-option-size'
    ],
    'scrollbar-component': 'scrollbar',
    'form-field': 'form-field-hint',
    forms: 'form-field-size-height',
    option: 'kbq-list',
    optgroup: 'kbq-optgroup-font-default',
    'option-action': [
        'kbq-list-font-text-line-height'
    ],
    'timezone-option': [
        'kbq-select-size',
        'kbq-select-panel',
        'kbq-option-size'
    ],
    tag: [
        'kbq-tag-list',
        'tag-input-font'
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
    sidepanel: 'sidepanel-container',
    forms: 'form',
    tabs: 'tab-group, .kbq-tab-nav-bar',
    tag: 'tag, .kbq-tag-list, .kbq-tag-input',
    'tag-input': 'form-field-type-tag-list'
};

const applyCustomTransformations = (dictionary) => {
    dictionary.allProperties = dictionary.allTokens = dictionary.allTokens.flatMap((token) => {
        if (typeof token.value === 'object' && token.type === 'font') {
            return unwrapObjectTransformer(token);
        }
        token.name = token.name.replace(/(light|dark)-/, '');
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
    timezone: [{ path: 'timezone/timezone-option-tokens.scss', aliasName: 'timezone-option' }],
    scrollbars: [
        { path: 'core/styles/theming/scrollbar-tokens.scss', aliasName: 'scrollbar' },
        { path: 'scrollbar/scrollbar-tokens.scss', aliasName: 'scrollbar-component' }
    ],
    forms: 'core/forms/forms-tokens.scss',
    option: [
        { path: 'core/option/option-tokens.scss', aliasName: 'option' },
        { path: 'core/option/optgroup-tokens.scss', aliasName: 'optgroup' },
        { path: 'core/option/option-action-tokens.scss', aliasName: 'option-action' }
    ],
    tag: [
        { path: 'tags/tag-tokens.scss', aliasName: 'tag' },
        { path: 'tags/tag-input-tokens.scss', aliasName: 'tag-input' }
    ]
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
