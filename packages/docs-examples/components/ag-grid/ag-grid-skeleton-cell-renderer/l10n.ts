import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the ag-grid examples. */
export interface ExampleTranslation {
    headerText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headerText: 'Текст'
    },
    default: {
        headerText: 'Text'
    }
};
