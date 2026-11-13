import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the loader-overlay examples. */
export interface ExampleTranslation {
    loading: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка'
    },
    default: {
        loading: 'Loading'
    }
};
