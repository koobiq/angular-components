import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the load-text example. */
export interface ExampleTranslation {
    headerText: string;
    loading: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headerText: 'Текст',
        loading: 'Загрузка...'
    },
    default: {
        headerText: 'Text',
        loading: 'Loading...'
    }
};
