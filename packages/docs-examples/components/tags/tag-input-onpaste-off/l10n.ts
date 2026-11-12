import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the onpaste-off example. */
export interface ExampleTranslation {
    newTag: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        newTag: 'Новый тег'
    },
    default: {
        newTag: 'New tag'
    }
};
