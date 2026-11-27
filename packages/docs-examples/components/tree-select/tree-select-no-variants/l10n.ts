import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tree-select-no-variants example. */
export interface ExampleTranslation {
    emptySelect: string;
    noOptions: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        emptySelect: 'Пустой tree-select',
        noOptions: 'Нет вариантов выбора'
    },
    default: {
        emptySelect: 'Empty tree-select',
        noOptions: 'No options to select'
    }
};
