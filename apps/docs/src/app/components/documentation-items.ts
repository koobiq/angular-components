/* tslint:disable:naming-convention */
import { Injectable } from '@angular/core';


export interface DocItem {
    id: string;
    name: string;
    hasApi: boolean;
    hasExamples: boolean;
    isGuide?: boolean;
    apiId?: string;
    svgPreview?: string;
    summary?: string;
    packageName?: string;
    examples?: string[];
}

export interface DocCategory {
    id: string;
    name: string;
    items: DocItem[];
    summary?: string;
}

function updatePackageName(categories, name) {
    categories.forEach((category) => category.items.forEach((doc) => doc.packageName = name));
}


const MAIN = 'main';
const COMPONENTS = 'components';
const OTHER = 'other';
const ICONS = 'icons';
const CDK = 'cdk';

const DOCS: { [key: string]: DocCategory[] } = {
    [MAIN]: [
        {
            id: 'main',
            name: 'Основное',
            items: [
                {
                    id: 'installation',
                    name: 'Установка',
                    svgPreview: 'install',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false,
                    examples: []
                },
                {
                    id: 'versioning',
                    name: 'Версионирование',
                    svgPreview: 'versioning',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false,
                    examples: []
                },
                {
                    id: 'directory-structure',
                    name: 'Структура каталогов',
                    svgPreview: 'catalog structure',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false,
                    examples: []
                },
                {
                    id: 'component-health',
                    name: 'Статус компонент',
                    svgPreview: 'component statuses',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false,
                    examples: []
                },
                {
                    id: 'theming',
                    name: 'Подключение и настройка тем',
                    svgPreview: 'themes',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false,
                    examples: []
                },
                {
                    id: 'typography',
                    name: 'Типографика',
                    svgPreview: 'typography',
                    hasApi: false,
                    hasExamples: false,
                    examples: ['typography-types']
                }
            ]
        }
    ],
    [COMPONENTS]: [
        {
            id: 'components',
            name: 'Компоненты',
            items:  [
                {
                    id: 'alert',
                    name: 'Alert',
                    svgPreview: 'alerts',
                    hasApi: true,
                    apiId: 'alert',
                    hasExamples: false,
                    examples: ['alert-types']
                },
                {
                    id: 'autocomplete',
                    name: 'Autocomplete',
                    svgPreview: 'autocomplete',
                    hasApi: true,
                    apiId: 'autocomplete',
                    hasExamples: false,
                    examples: ['autocomplete-types']
                },
                {
                    id: 'badge',
                    name: 'Badge',
                    svgPreview: 'badges',
                    hasApi: true,
                    apiId: 'badge',
                    hasExamples: false,
                    examples: ['badge-types']
                },
                {
                    id: 'button',
                    name: 'Button',
                    svgPreview: 'button',
                    hasApi: true,
                    apiId: 'button',
                    hasExamples: false,
                    summary: 'An interactive button with a range of presentation options.',
                    examples: ['button-types']
                },
                {
                    id: 'button-toggle',
                    name: 'Button toggle',
                    svgPreview: 'button toggle',
                    hasApi: true,
                    apiId: 'button-toggle',
                    hasExamples: false,
                    examples: ['button-toggle-types']
                },
                {
                    id: 'card',
                    name: 'Card',
                    svgPreview: 'card',
                    hasApi: true,
                    apiId: 'card',
                    hasExamples: false,
                    examples: ['card-types']
                },
                {
                    id: 'checkbox',
                    name: 'Checkbox',
                    svgPreview: 'checkbox',
                    hasApi: true,
                    apiId: 'checkbox',
                    hasExamples: false,
                    examples: ['checkbox-types']
                },
                {
                    id: 'code-block',
                    name: 'Code block',
                    svgPreview: 'code-block',
                    hasApi: true,
                    apiId: 'code-block',
                    hasExamples: false,
                    examples: ['code-block-types']
                },

                {
                    id: 'datepicker',
                    name: 'Datepicker',
                    svgPreview: 'datepicker',
                    hasApi: true,
                    apiId: 'datepicker',
                    hasExamples: false,
                    examples: ['datepicker-types']
                },
                {
                    id: 'divider',
                    name: 'Divider',
                    svgPreview: 'divider',
                    hasApi: true,
                    apiId: 'divider',
                    hasExamples: false,
                    examples: ['divider-types']
                },
                {
                    id: 'dl',
                    name: 'Description list',
                    svgPreview: 'description list',
                    hasApi: true,
                    apiId: 'dl',
                    hasExamples: false,
                    examples: ['dl-types']
                },
                {
                    id: 'dropdown',
                    name: 'Dropdown',
                    svgPreview: 'dropdown',
                    hasApi: true,
                    apiId: 'dropdown',
                    hasExamples: false,
                    examples: ['dropdown-types']
                },
                {
                    id: 'icon',
                    name: 'Icon',
                    svgPreview: 'icons',
                    hasApi: true,
                    apiId: 'icon',
                    hasExamples: false,
                    examples: ['icon-types']
                },
                {
                    id: 'input',
                    name: 'Input',
                    svgPreview: 'input',
                    hasApi: true,
                    apiId: 'input',
                    hasExamples: false,
                    examples: ['input-types']
                },
                {
                    id: 'file-upload',
                    name: 'File upload',
                    svgPreview: 'file upload',
                    hasApi: true,
                    apiId: 'file-upload',
                    hasExamples: true,
                    examples: ['file-upload-types']
                },
                {
                    id: 'layout-flex',
                    name: 'Layout flex',
                    svgPreview: 'layout flex',
                    hasApi: false,
                    hasExamples: false,
                    examples: ['layout-flex-types']
                },
                {
                    id: 'link',
                    name: 'Link',
                    svgPreview: 'link',
                    hasApi: true,
                    apiId: 'link',
                    hasExamples: false,
                    examples: ['link-types']
                },
                {
                    id: 'list',
                    name: 'List',
                    svgPreview: 'list',
                    hasApi: true,
                    apiId: 'list',
                    hasExamples: false,
                    examples: ['list-types']
                },
                {
                    id: 'loader-overlay',
                    name: 'Overlay',
                    svgPreview: 'overlay',
                    hasApi: true,
                    apiId: 'loader-overlay',
                    hasExamples: false,
                    examples: ['loader-overlay-types']
                },
                {
                    id: 'markdown',
                    name: 'Markdown',
                    svgPreview: 'markdown',
                    hasApi: true,
                    apiId: 'markdown',
                    hasExamples: false,
                    examples: ['markdown-types']
                },
                {
                    id: 'modal',
                    name: 'Modal',
                    svgPreview: 'modal',
                    hasApi: true,
                    apiId: 'modal',
                    hasExamples: false,
                    examples: ['modal-types']
                },
                {
                    id: 'navbar',
                    name: 'Navbar',
                    svgPreview: 'navbar',
                    hasApi: true,
                    apiId: 'navbar',
                    hasExamples: false,
                    examples: ['navbar-types']
                },
                {
                    id: 'popover',
                    name: 'Popover',
                    svgPreview: 'popover',
                    hasApi: true,
                    apiId: 'popover',
                    hasExamples: false,
                    examples: ['popover-types']
                },
                {
                    id: 'progress-bar',
                    name: 'Progress bar',
                    svgPreview: 'progress-bar',
                    hasApi: true,
                    apiId: 'progress-bar',
                    hasExamples: false,
                    examples: ['progress-bar-types']
                },
                {
                    id: 'progress-spinner',
                    name: 'Progress spinner',
                    svgPreview: 'progress-spinner',
                    hasApi: true,
                    apiId: 'progress-spinner',
                    hasExamples: false,
                    examples: ['progress-spinner-types']
                },
                {
                    id: 'radio',
                    name: 'Radio',
                    svgPreview: 'radio',
                    hasApi: true,
                    apiId: 'radio',
                    hasExamples: false,
                    examples: ['radio-types']
                },
                {
                    id: 'scrollbar',
                    name: 'Scrollbar',
                    svgPreview: 'scrollbar',
                    hasApi: true,
                    apiId: 'scrollbar',
                    hasExamples: false,
                    examples: []
                },
                {
                    id: 'select',
                    name: 'Select',
                    svgPreview: 'select',
                    hasApi: true,
                    apiId: 'select',
                    hasExamples: false,
                    examples: ['select-types']
                },
                {
                    id: 'sidepanel',
                    name: 'Sidepanel',
                    svgPreview: 'sidepanel',
                    hasApi: true,
                    apiId: 'sidepanel',
                    hasExamples: false,
                    examples: ['sidepanel-types']
                },
                {
                    id: 'splitter',
                    name: 'Splitter',
                    svgPreview: 'splitter',
                    hasApi: true,
                    apiId: 'splitter',
                    hasExamples: false,
                    examples: ['splitter-types']
                },
                {
                    id: 'table',
                    name: 'Table',
                    svgPreview: 'table',
                    hasApi: true,
                    apiId: 'table',
                    hasExamples: false,
                    examples: ['table-types']
                },
                {
                    id: 'tabs',
                    name: 'Tabs',
                    svgPreview: 'tabs',
                    hasApi: true,
                    apiId: 'tabs',
                    hasExamples: false,
                    examples: ['tabs-types']
                },
                {
                    id: 'tag',
                    name: 'Tag',
                    svgPreview: 'tags',
                    hasApi: true,
                    apiId: 'tag',
                    hasExamples: false,
                    examples: ['tag-types']
                },
                {
                    id: 'tag-autocomplete',
                    name: 'Tag autocomplete',
                    svgPreview: 'tags autocomplete',
                    hasApi: true,
                    apiId: 'tag',
                    hasExamples: false,
                    examples: ['tag-autocomplete-types']
                },
                {
                    id: 'tag-input',
                    name: 'Tag input',
                    svgPreview: 'tags input',
                    hasApi: true,
                    apiId: 'tag',
                    hasExamples: false,
                    examples: ['tag-input-types']
                },
                {
                    id: 'tag-list',
                    name: 'Tag list',
                    svgPreview: 'tags list',
                    hasApi: true,
                    apiId: 'tag',
                    hasExamples: false,
                    examples: ['tag-list-types']
                },
                {
                    id: 'textarea',
                    name: 'Textarea',
                    svgPreview: 'textarea',
                    hasApi: true,
                    apiId: 'textarea',
                    hasExamples: false,
                    examples: ['textarea-types']
                },
                {
                    id: 'timepicker',
                    name: 'Timepicker',
                    svgPreview: 'timepicker',
                    hasApi: true,
                    apiId: 'timepicker',
                    hasExamples: false,
                    examples: ['timepicker-types']
                },
                {
                    id: 'timezone',
                    name: 'Timezone',
                    svgPreview: 'timezone',
                    hasApi: true,
                    apiId: 'timezone',
                    hasExamples: false,
                    examples: ['timezone-types']
                },
                {
                    id: 'toast',
                    name: 'Toast',
                    svgPreview: 'toast',
                    hasApi: true,
                    apiId: 'toast',
                    hasExamples: true,
                    examples: ['toast-types']
                },
                {
                    id: 'toggle',
                    name: 'Toggle',
                    svgPreview: 'toggle',
                    hasApi: true,
                    apiId: 'toggle',
                    hasExamples: false,
                    examples: ['toggle-types']
                },
                {
                    id: 'tooltip',
                    name: 'Tooltip',
                    svgPreview: 'tooltip',
                    hasApi: true,
                    apiId: 'tooltip',
                    hasExamples: false,
                    examples: ['tooltip-types']
                },
                {
                    id: 'tree',
                    name: 'Tree',
                    svgPreview: 'tree',
                    hasApi: true,
                    apiId: 'tree',
                    hasExamples: true,
                    examples: ['tree-types']
                },
                {
                    id: 'tree-select',
                    name: 'Tree select',
                    svgPreview: 'tree-select',
                    hasApi: true,
                    apiId: 'tree-select',
                    hasExamples: false,
                    examples: ['treeSelect-types']
                },
            ]
        }
    ],
    [OTHER]: [
       {
        id: OTHER,
        name: 'Другое',
        summary: '',
        items: [
            {
                id: 'date-formatter',
                name: 'Date formatter',
                svgPreview: 'date',
                hasApi: true,
                apiId: 'date-formatter',
                hasExamples: false,
                examples: ['date-formatter-types']
            },
            {
                id: 'forms',
                name: 'Forms',
                svgPreview: 'forms',
                hasApi: true,
                apiId: 'forms',
                hasExamples: false,
                examples: ['forms-types']
            },
            {
                id: 'number-formatter',
                name: 'Number formatter',
                svgPreview: 'number',
                hasApi: true,
                apiId: 'number-formatter',
                hasExamples: false,
                examples: ['number-formatter-types']
            },
            {
                id: 'validation',
                name: 'Validation',
                svgPreview: 'validation',
                hasApi: false,
                hasExamples: false,
                examples: ['validation-types']
            }
        ],
       }
    ],
    [ICONS]: [{
        id: 'icons',
        name: 'Иконки',
        summary: '',
        items: []
    }],
    [CDK]: [
        {
            id: 'cdk',
            name: 'CDK',
            summary: '',
            items: [
                {
                    id: 'a11y',
                    name: 'Key managers',
                    hasApi: true,
                    apiId: 'a11y',
                    hasExamples: false,
                    examples: ['key-managers-types']
                },
                {
                    id: 'keycodes',
                    name: 'Keycodes',
                    hasApi: true,
                    apiId: 'keycodes',
                    hasExamples: false,
                    examples: ['keycodes-types']
                }
            ]
        }
    ]
};

updatePackageName(DOCS[MAIN], MAIN);
updatePackageName(DOCS[COMPONENTS], COMPONENTS);
updatePackageName(DOCS[OTHER], OTHER);
updatePackageName(DOCS[ICONS], ICONS);
updatePackageName(DOCS[CDK], CDK);


const ALL_MAIN = DOCS[MAIN]
    .reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_COMPONENTS = DOCS[COMPONENTS]
    .reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_OTHER = DOCS[OTHER]
    .reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_ICONS = DOCS[ICONS]
    .reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_CDK = DOCS[CDK]
    .reduce((result, cdk) => result.concat(cdk.items), [] as DocItem[]);

const ALL_DOCS = [
    ...ALL_MAIN,
    ...ALL_COMPONENTS,
    ...ALL_OTHER,
    ...ALL_ICONS,
    ...ALL_CDK
];

const ALL_CATEGORIES = [
    ...DOCS[MAIN],
    ...DOCS[COMPONENTS],
    ...DOCS[OTHER],
    ...DOCS[ICONS],
    ...DOCS[CDK]
];

@Injectable()
export class DocumentationItems {
    getCategories(section?: string): DocCategory[] {
        if (section) {
            return DOCS[section];
        }

        return ALL_CATEGORIES;
    }

    getItems(section: string): DocItem[] {
        switch (section) {
            case COMPONENTS:
                return ALL_COMPONENTS;
            case CDK:
                return ALL_CDK;
            default:
                return [];
        }
    }

    getItemById(id: string, section: string): DocItem | undefined {
        if (!id) { return; }

        return ALL_DOCS.find((doc) => doc.id === id && doc.packageName === section);
    }

    getCategoryById(id: string): DocCategory | undefined {
        return ALL_CATEGORIES.find((c) => c.id === id);
    }
}
