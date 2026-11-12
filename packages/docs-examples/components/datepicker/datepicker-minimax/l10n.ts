import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleTranslation {
    minimaxHint: string;
    onlyNumbers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        minimaxHint: 'Выберите дату между 14 декабря 2023 и 25 августа 2024.',
        onlyNumbers: 'Только цифры'
    },
    default: {
        minimaxHint: 'Select a date between December 14, 2023, and August 25, 2024.',
        onlyNumbers: 'Only numbers'
    }
};
