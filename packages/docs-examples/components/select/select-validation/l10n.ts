import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-validation example. */
export interface ExampleTranslation {
    placeholder: string;
    invalid: string;
    none: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        invalid: 'Невалидный',
        none: 'Нет'
    },
    default: {
        placeholder: 'Placeholder',
        invalid: 'Invalid',
        none: 'None'
    }
};
