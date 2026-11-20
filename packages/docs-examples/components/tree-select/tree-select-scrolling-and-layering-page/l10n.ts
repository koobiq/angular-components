import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tree-select-scrolling-and-layering-page example. */
export interface ExampleTranslation {
    label: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        label: 'Файл'
    },
    default: {
        label: 'File'
    }
};
