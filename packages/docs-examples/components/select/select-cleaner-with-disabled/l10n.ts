import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-cleaner-with-disabled example. */
export interface ExampleTranslation {
    kept: string;
    cleared: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        kept: 'Сохранено',
        cleared: 'Очищено'
    },
    default: {
        kept: 'Kept',
        cleared: 'Cleared'
    }
};
