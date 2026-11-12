import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the loader-overlay examples. */
export interface ExampleTranslation {
    loadingData: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loadingData: 'Загрузка данных'
    },
    default: {
        loadingData: 'Loading data'
    }
};
