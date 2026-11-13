import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the timepicker examples. */
export interface ExampleTranslation {
    onlyNumbers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        onlyNumbers: 'Только цифры'
    },
    default: {
        onlyNumbers: 'Only numbers'
    }
};
