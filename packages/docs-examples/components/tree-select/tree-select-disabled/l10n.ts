import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tree-select-disabled example. */
export interface ExampleTranslation {
    placeholder: string;
    forSelect: string;
    forOptions: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        forSelect: 'Для селекта',
        forOptions: 'Для опций'
    },
    default: {
        placeholder: 'Placeholder',
        forSelect: 'For select',
        forOptions: 'For options'
    }
};
