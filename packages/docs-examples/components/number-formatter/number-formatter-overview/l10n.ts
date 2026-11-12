import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the number-formatter examples. Pipe and parameter names (kbqNumber, digitsInfo) stay English as API names. */
export interface ExampleTranslation {
    number: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        number: 'Число'
    },
    default: {
        number: 'Number'
    }
};
