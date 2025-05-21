import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { DocsLocale } from '../constants/locale';

const expiresAt = (expiresAt: string) => {
    const createdDate = DateTime.fromISO(expiresAt);

    if (!createdDate.isValid) {
        throw new Error(createdDate.invalidReason);
    }

    return createdDate.diffNow('days').days > 0;
};

export type DocItem = {
    id: string;
    name: Record<DocsLocale, string>;
    hasApi: boolean;
    hasExamples: boolean;
    isGuide?: boolean;
    apiId?: string;
    svgPreview?: string;
    packageName?: string;
    /**
     * Indicates whether documentation item as "new".
     * Determined by comparing the current date with expiration date.
     */
    isNew?: boolean;
};

export type DocCategory = {
    id: string;
    name: Record<DocsLocale, string>;
    items: DocItem[];
    isPreviewed?: boolean;
};

function updatePackageName(categories, name) {
    categories.forEach((category) => category.items.forEach((doc) => (doc.packageName = name)));
}

export const DOCS_ITEM_SECTIONS = ['overview', 'api', 'examples'];

const MAIN = 'main';
const COMPONENTS = 'components';
const OTHER = 'other';
const ICONS = 'icons';
const CDK = 'cdk';

const DOCS: { [key: string]: DocCategory[] } = {
    [MAIN]: [
        {
            id: 'main',
            name: {
                ru: 'Основное',
                en: 'Main'
            },
            isPreviewed: true,
            items: [
                {
                    id: 'installation',
                    name: {
                        ru: 'Установка',
                        en: 'Installation'
                    },
                    svgPreview: 'install',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'versioning',
                    name: {
                        ru: 'Версионирование',
                        en: 'Versioning'
                    },
                    svgPreview: 'versioning',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'directory-structure',
                    name: {
                        ru: 'Структура каталогов',
                        en: 'Directory structure'
                    },
                    svgPreview: 'catalog structure',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'theming',
                    name: {
                        ru: 'Темизация',
                        en: 'Theming'
                    },
                    svgPreview: 'themes',
                    isGuide: true,
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'typography',
                    name: {
                        ru: 'Типографика',
                        en: 'Typography'
                    },
                    svgPreview: 'typography',
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'design-tokens',
                    name: {
                        ru: 'Дизайн-токены',
                        en: 'Design tokens'
                    },
                    svgPreview: 'tokens',
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'schematics',
                    name: {
                        ru: 'Схематики',
                        en: 'Schematics'
                    },
                    hasApi: false,
                    hasExamples: false,
                    isNew: expiresAt('2025-06-01')
                }
            ]
        }
    ],
    [COMPONENTS]: [
        {
            id: 'components',
            name: {
                ru: 'Компоненты',
                en: 'Components'
            },
            isPreviewed: true,
            items: [
                {
                    id: 'accordion',
                    name: {
                        ru: 'Accordion',
                        en: 'Accordion'
                    },
                    svgPreview: 'accordion',
                    hasApi: true,
                    apiId: 'accordion',
                    hasExamples: false
                },
                {
                    id: 'actions-panel',
                    name: {
                        ru: 'Actions panel',
                        en: 'Actions panel'
                    },
                    svgPreview: 'actions-panel',
                    hasApi: true,
                    apiId: 'actions-panel',
                    hasExamples: false
                },
                {
                    id: 'ag-grid',
                    name: {
                        ru: 'AG grid',
                        en: 'AG grid'
                    },
                    svgPreview: 'ag-grid',
                    hasApi: false,
                    hasExamples: false,
                    isNew: expiresAt('2025-05-04')
                },
                {
                    id: 'alert',
                    name: {
                        ru: 'Alert',
                        en: 'Alert'
                    },
                    svgPreview: 'alerts',
                    hasApi: true,
                    apiId: 'alert',
                    hasExamples: false
                },
                {
                    id: 'autocomplete',
                    name: {
                        ru: 'Autocomplete',
                        en: 'Autocomplete'
                    },
                    svgPreview: 'autocomplete',
                    hasApi: true,
                    apiId: 'autocomplete',
                    hasExamples: false
                },
                {
                    id: 'badge',
                    name: {
                        ru: 'Badge',
                        en: 'Badge'
                    },
                    svgPreview: 'badges',
                    hasApi: true,
                    apiId: 'badge',
                    hasExamples: false
                },
                {
                    id: 'breadcrumbs',
                    name: {
                        ru: 'Breadcrumbs',
                        en: 'Breadcrumbs'
                    },
                    svgPreview: 'breadcrumbs',
                    hasApi: true,
                    apiId: 'breadcrumbs',
                    hasExamples: true
                },
                {
                    id: 'button',
                    name: {
                        ru: 'Button',
                        en: 'Button'
                    },
                    svgPreview: 'button',
                    hasApi: true,
                    apiId: 'button',
                    hasExamples: false
                },
                {
                    id: 'button-toggle',
                    name: {
                        ru: 'Button toggle',
                        en: 'Button toggle'
                    },
                    svgPreview: 'button toggle',
                    hasApi: true,
                    apiId: 'button-toggle',
                    hasExamples: false
                },
                {
                    id: 'checkbox',
                    name: {
                        ru: 'Checkbox',
                        en: 'Checkbox'
                    },
                    svgPreview: 'checkbox',
                    hasApi: true,
                    apiId: 'checkbox',
                    hasExamples: false
                },
                {
                    id: 'code-block',
                    name: {
                        ru: 'Code block',
                        en: 'Code block'
                    },
                    svgPreview: 'code-block',
                    hasApi: true,
                    apiId: 'code-block',
                    hasExamples: true
                },
                {
                    id: 'core',
                    name: {
                        ru: 'Core',
                        en: 'Core'
                    },
                    svgPreview: '',
                    hasApi: true,
                    apiId: 'core',
                    hasExamples: false,
                    isNew: expiresAt('2025-05-04')
                },
                {
                    id: 'datepicker',
                    name: {
                        ru: 'Datepicker',
                        en: 'Datepicker'
                    },
                    svgPreview: 'datepicker',
                    hasApi: true,
                    apiId: 'datepicker',
                    hasExamples: false
                },
                {
                    id: 'divider',
                    name: {
                        ru: 'Divider',
                        en: 'Divider'
                    },
                    svgPreview: 'divider',
                    hasApi: true,
                    apiId: 'divider',
                    hasExamples: false
                },
                {
                    id: 'dl',
                    name: {
                        ru: 'Description list',
                        en: 'Description list'
                    },
                    svgPreview: 'description list',
                    hasApi: true,
                    apiId: 'dl',
                    hasExamples: false
                },
                {
                    id: 'dropdown',
                    name: {
                        ru: 'Dropdown',
                        en: 'Dropdown'
                    },
                    svgPreview: 'dropdown',
                    hasApi: true,
                    apiId: 'dropdown',
                    hasExamples: false
                },
                {
                    id: 'empty-state',
                    name: {
                        ru: 'Empty state',
                        en: 'Empty state'
                    },
                    svgPreview: 'empty-state',
                    hasApi: true,
                    apiId: 'empty-state',
                    hasExamples: false
                },
                {
                    id: 'icon',
                    name: {
                        ru: 'Icon',
                        en: 'Icon'
                    },
                    svgPreview: 'icons',
                    hasApi: true,
                    apiId: 'icon',
                    hasExamples: false
                },
                {
                    id: 'icon-item',
                    name: {
                        ru: 'Icon Item',
                        en: 'Icon Item'
                    },
                    svgPreview: 'icon-item',
                    hasApi: true,
                    apiId: 'icon',
                    hasExamples: false
                },
                {
                    id: 'input',
                    name: {
                        ru: 'Input',
                        en: 'Input'
                    },
                    svgPreview: 'input',
                    hasApi: true,
                    apiId: 'input',
                    hasExamples: false
                },
                {
                    id: 'file-upload',
                    name: {
                        ru: 'File upload',
                        en: 'File upload'
                    },
                    svgPreview: 'file upload',
                    hasApi: true,
                    apiId: 'file-upload',
                    hasExamples: true
                },
                {
                    id: 'filter-bar',
                    name: {
                        ru: 'Filter Bar',
                        en: 'Filter Bar'
                    },
                    svgPreview: 'filter-bar',
                    hasApi: true,
                    apiId: 'filter-bar',
                    hasExamples: true
                },
                {
                    id: 'experimental-form-field',
                    name: {
                        ru: 'Form field (experimental)',
                        en: 'Form field (experimental)'
                    },
                    svgPreview: 'form-field',
                    hasApi: true,
                    apiId: 'experimental-form-field',
                    hasExamples: false
                },
                {
                    id: 'layout-flex',
                    name: {
                        ru: 'Layout flex',
                        en: 'Layout flex'
                    },
                    svgPreview: 'layout flex',
                    hasApi: false,
                    hasExamples: false
                },
                {
                    id: 'link',
                    name: {
                        ru: 'Link',
                        en: 'Link'
                    },
                    svgPreview: 'link',
                    hasApi: true,
                    apiId: 'link',
                    hasExamples: false
                },
                {
                    id: 'list',
                    name: {
                        ru: 'List',
                        en: 'List'
                    },
                    svgPreview: 'list',
                    hasApi: true,
                    apiId: 'list',
                    hasExamples: false
                },
                {
                    id: 'loader-overlay',
                    name: {
                        ru: 'Overlay',
                        en: 'Overlay'
                    },
                    svgPreview: 'overlay',
                    hasApi: true,
                    apiId: 'loader-overlay',
                    hasExamples: false
                },
                {
                    id: 'markdown',
                    name: {
                        ru: 'Markdown',
                        en: 'Markdown'
                    },
                    svgPreview: 'markdown',
                    hasApi: true,
                    apiId: 'markdown',
                    hasExamples: true
                },
                {
                    id: 'modal',
                    name: {
                        ru: 'Modal',
                        en: 'Modal'
                    },
                    svgPreview: 'modal',
                    hasApi: true,
                    apiId: 'modal',
                    hasExamples: true
                },
                {
                    id: 'navbar',
                    name: {
                        ru: 'Navbar',
                        en: 'Navbar'
                    },
                    svgPreview: 'navbar',
                    hasApi: true,
                    apiId: 'navbar',
                    hasExamples: false
                },
                {
                    id: 'overflow-items',
                    name: {
                        ru: 'Overflow items',
                        en: 'Overflow items'
                    },
                    hasApi: true,
                    apiId: 'overflow-items',
                    hasExamples: false
                },
                {
                    id: 'popover',
                    name: {
                        ru: 'Popover',
                        en: 'Popover'
                    },
                    svgPreview: 'popover',
                    hasApi: true,
                    apiId: 'popover',
                    hasExamples: true
                },
                {
                    id: 'progress-bar',
                    name: {
                        ru: 'Progress bar',
                        en: 'Progress bar'
                    },
                    svgPreview: 'progress-bar',
                    hasApi: true,
                    apiId: 'progress-bar',
                    hasExamples: false
                },
                {
                    id: 'progress-spinner',
                    name: {
                        ru: 'Progress spinner',
                        en: 'Progress spinner'
                    },
                    svgPreview: 'progress-spinner',
                    hasApi: true,
                    apiId: 'progress-spinner',
                    hasExamples: false
                },
                {
                    id: 'radio',
                    name: {
                        ru: 'Radio',
                        en: 'Radio'
                    },
                    svgPreview: 'radio',
                    hasApi: true,
                    apiId: 'radio',
                    hasExamples: false
                },
                {
                    id: 'scrollbar',
                    name: {
                        ru: 'Scrollbar',
                        en: 'Scrollbar'
                    },
                    svgPreview: 'scrollbar',
                    hasApi: true,
                    apiId: 'scrollbar',
                    hasExamples: true
                },
                {
                    id: 'select',
                    name: {
                        ru: 'Select',
                        en: 'Select'
                    },
                    svgPreview: 'select',
                    hasApi: true,
                    apiId: 'select',
                    hasExamples: true
                },
                {
                    id: 'sidebar',
                    name: {
                        ru: 'Sidebar',
                        en: 'Sidebar'
                    },
                    svgPreview: 'sidebar',
                    hasApi: true,
                    apiId: 'sidebar',
                    hasExamples: true,
                    isNew: expiresAt('2025-06-16')
                },
                {
                    id: 'sidepanel',
                    name: {
                        ru: 'Sidepanel',
                        en: 'Sidepanel'
                    },
                    svgPreview: 'sidepanel',
                    hasApi: true,
                    apiId: 'sidepanel',
                    hasExamples: false
                },
                {
                    id: 'splitter',
                    name: {
                        ru: 'Splitter',
                        en: 'Splitter'
                    },
                    svgPreview: 'splitter',
                    hasApi: true,
                    apiId: 'splitter',
                    hasExamples: false
                },
                {
                    id: 'table',
                    name: {
                        ru: 'Table',
                        en: 'Table'
                    },
                    svgPreview: 'table',
                    hasApi: true,
                    apiId: 'table',
                    hasExamples: false
                },
                {
                    id: 'tabs',
                    name: {
                        ru: 'Tabs',
                        en: 'Tabs'
                    },
                    svgPreview: 'tabs',
                    hasApi: true,
                    apiId: 'tabs',
                    hasExamples: true
                },
                {
                    id: 'tag',
                    name: {
                        ru: 'Tag',
                        en: 'Tag'
                    },
                    svgPreview: 'tags',
                    hasApi: true,
                    apiId: 'tags',
                    hasExamples: false
                },
                {
                    id: 'tag-autocomplete',
                    name: {
                        ru: 'Tag autocomplete',
                        en: 'Tag autocomplete'
                    },
                    svgPreview: 'tags autocomplete',
                    hasApi: true,
                    apiId: 'tags',
                    hasExamples: true
                },
                {
                    id: 'tag-input',
                    name: {
                        ru: 'Tag input',
                        en: 'Tag input'
                    },
                    svgPreview: 'tags input',
                    hasApi: true,
                    apiId: 'tags',
                    hasExamples: true
                },
                {
                    id: 'tag-list',
                    name: {
                        ru: 'Tag list',
                        en: 'Tag list'
                    },
                    svgPreview: 'tags list',
                    hasApi: true,
                    apiId: 'tags',
                    hasExamples: false
                },
                {
                    id: 'textarea',
                    name: {
                        ru: 'Textarea',
                        en: 'Textarea'
                    },
                    svgPreview: 'textarea',
                    hasApi: true,
                    apiId: 'textarea',
                    hasExamples: false
                },
                {
                    id: 'timepicker',
                    name: {
                        ru: 'Timepicker',
                        en: 'Timepicker'
                    },
                    svgPreview: 'timepicker',
                    hasApi: true,
                    apiId: 'timepicker',
                    hasExamples: false
                },
                {
                    id: 'timezone',
                    name: {
                        ru: 'Timezone',
                        en: 'Timezone'
                    },
                    svgPreview: 'timezone',
                    hasApi: true,
                    apiId: 'timezone',
                    hasExamples: false
                },
                {
                    id: 'toast',
                    name: {
                        ru: 'Toast',
                        en: 'Toast'
                    },
                    svgPreview: 'toast',
                    hasApi: true,
                    apiId: 'toast',
                    hasExamples: true
                },
                {
                    id: 'toggle',
                    name: {
                        ru: 'Toggle',
                        en: 'Toggle'
                    },
                    svgPreview: 'toggle',
                    hasApi: true,
                    apiId: 'toggle',
                    hasExamples: false
                },
                {
                    id: 'tooltip',
                    name: {
                        ru: 'Tooltip',
                        en: 'Tooltip'
                    },
                    svgPreview: 'tooltip',
                    hasApi: true,
                    apiId: 'tooltip',
                    hasExamples: false
                },
                {
                    id: 'top-bar',
                    name: {
                        ru: 'Topbar',
                        en: 'Topbar'
                    },
                    svgPreview: 'top-bar',
                    hasApi: true,
                    apiId: 'top-bar',
                    hasExamples: false
                },
                {
                    id: 'tree',
                    name: {
                        ru: 'Tree',
                        en: 'Tree'
                    },
                    svgPreview: 'tree',
                    hasApi: true,
                    apiId: 'tree',
                    hasExamples: true
                },
                {
                    id: 'tree-select',
                    name: {
                        ru: 'Tree select',
                        en: 'Tree select'
                    },
                    svgPreview: 'tree-select',
                    hasApi: true,
                    apiId: 'tree-select',
                    hasExamples: true
                }
            ]
        }
    ],
    [OTHER]: [
        {
            id: OTHER,
            name: {
                ru: 'Другое',
                en: 'Other'
            },
            isPreviewed: true,
            items: [
                {
                    id: 'date-formatter',
                    name: {
                        ru: 'Date formatter',
                        en: 'Date formatter'
                    },
                    svgPreview: 'date',
                    hasApi: false,
                    apiId: 'date-formatter',
                    hasExamples: true
                },
                {
                    id: 'forms',
                    name: {
                        ru: 'Forms',
                        en: 'Forms'
                    },
                    svgPreview: 'forms',
                    hasApi: false,
                    apiId: 'forms',
                    hasExamples: false
                },
                {
                    id: 'number-formatter',
                    name: {
                        ru: 'Number formatter',
                        en: 'Number formatter'
                    },
                    svgPreview: 'number',
                    hasApi: false,
                    apiId: 'number-formatter',
                    hasExamples: false
                },
                {
                    id: 'validation',
                    name: {
                        ru: 'Validation',
                        en: 'Validation'
                    },
                    svgPreview: 'validation',
                    hasApi: false,
                    hasExamples: false
                }
            ]
        }
    ],
    [ICONS]: [
        {
            id: 'icons',
            name: {
                ru: 'Иконки',
                en: 'Icons'
            },
            isPreviewed: false,
            items: []
        }
    ],
    [CDK]: [
        {
            id: 'cdk',
            name: {
                ru: 'CDK',
                en: 'CDK'
            },
            isPreviewed: false,
            items: [
                {
                    id: 'a11y',
                    name: {
                        ru: 'Key managers',
                        en: 'Key managers'
                    },
                    hasApi: true,
                    apiId: 'a11y',
                    hasExamples: false
                },
                {
                    id: 'keycodes',
                    name: {
                        ru: 'Keycodes',
                        en: 'Keycodes'
                    },
                    hasApi: true,
                    apiId: 'keycodes',
                    hasExamples: false
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

const ALL_MAIN = DOCS[MAIN].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_COMPONENTS = DOCS[COMPONENTS].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_OTHER = DOCS[OTHER].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_ICONS = DOCS[ICONS].reduce((result, category) => result.concat(category.items), [] as DocItem[]);

const ALL_CDK = DOCS[CDK].reduce((result, cdk) => result.concat(cdk.items), [] as DocItem[]);

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

@Injectable({ providedIn: 'root' })
export class DocumentationItems {
    getCategories(section?: string): DocCategory[] {
        if (section) {
            return DOCS[section];
        }

        return ALL_CATEGORIES;
    }

    getItems(section: string): DocItem[] {
        switch (section) {
            case COMPONENTS: {
                return ALL_COMPONENTS;
            }
            case CDK: {
                return ALL_CDK;
            }
            default: {
                return [];
            }
        }
    }

    getItemById(id: string, section: string): DocItem | undefined {
        if (!id) {
            return;
        }

        return ALL_DOCS.find((doc) => doc.id === id && doc.packageName === section);
    }

    getCategoryById(id: string): DocCategory | undefined {
        return ALL_CATEGORIES.find((c) => c.id === id);
    }
}
