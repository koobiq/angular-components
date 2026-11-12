import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the number-formatter examples. Pipe and parameter names (kbqNumber, digitsInfo) stay English as API names. */
export interface ExampleTranslation {
    locale: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        locale: 'Локаль'
    },
    default: {
        locale: 'Locale'
    }
};
