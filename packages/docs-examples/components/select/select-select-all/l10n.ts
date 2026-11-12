import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the select examples. Account names, network addresses and durations stay as-is. */
export interface ExampleTranslation {
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер'
    },
    default: {
        placeholder: 'Placeholder'
    }
};
