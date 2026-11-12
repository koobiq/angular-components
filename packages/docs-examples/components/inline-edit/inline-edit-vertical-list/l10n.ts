import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the inline-edit examples. Person names, role ids and permission ids stay as-is. */
export interface ExampleText {
    placeholder: string;
    country: string;
    capital: string;
    currency: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        country: 'Страна',
        capital: 'Столица',
        currency: 'Валюта'
    },
    default: {
        placeholder: 'Placeholder',
        country: 'Country',
        capital: 'Capital',
        currency: 'Currency'
    }
};
