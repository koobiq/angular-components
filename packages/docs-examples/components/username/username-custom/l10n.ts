import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the username examples. Person names and logins stay as proper nouns. */
export interface ExampleTranslation {
    nameFormat: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        nameFormat: 'Формат имени'
    },
    default: {
        nameFormat: 'Name format'
    }
};
