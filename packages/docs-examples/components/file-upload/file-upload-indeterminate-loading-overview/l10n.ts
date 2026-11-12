import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the file-upload examples. The custom-text examples keep their hardcoded per-locale data — demonstrating that API is their point. */
export interface ExampleTranslation {
    immediatelyLoad: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        immediatelyLoad: 'Немедленная загрузка на бэкенд...'
    },
    default: {
        immediatelyLoad: 'Immediately load to backend...'
    }
};
