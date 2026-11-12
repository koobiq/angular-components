import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleTranslation {
    filled: string;
    showAll: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        filled: 'Заливка',
        showAll: 'Показать всё'
    },
    default: {
        filled: 'Filled',
        showAll: 'Show all'
    }
};
