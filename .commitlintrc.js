// @ts-check

const scope_types = [
    'alert',
    'autocomplete',
    'badge',
    'build',
    'button',
    'button-toggle',
    'ci',
    'cli',
    'cdk',
    'checkbox',
    'chore',
    'core',
    'code-block',
    'common',
    'datepicker',
    'divider',
    'dl',
    'docs',
    'dropdown',
    'overlay',
    'formatter',
    'form-field',
    'hint',
    'icon',
    'icon-button',
    'icon-item',
    'input',
    'link',
    'list',
    'loader-overlay',
    'markdown',
    'modal',
    'number-input',
    'angular-moment-adapter',
    'angular-luxon-adapter',
    'navbar',
    'optgroup',
    'popover',
    'progress-bar',
    'progress-spinner',
    'pop-up',
    'radio',
    'schematics',
    'scrollbar',
    'select',
    'security',
    'sidepanel',
    'splitter',
    'table',
    'tabs',
    'tag',
    'textarea',
    'timepicker',
    'timezone',
    'toast',
    'toggle',
    'tooltip',
    'tree',
    'tree-select',
    'typography',
    'vertical-navbar',
    'visual',
    'validation',
    'layout',
    'title',
    'file-upload'
];

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'feature',
                'fix',
                'refactor',
                'docs',
                'build',
                'test',
                'ci',
                'chore'
            ]
        ],
        'scope-enum': [
            2,
            'always',
            scope_types
        ]
    }
};

module.exports = config;
