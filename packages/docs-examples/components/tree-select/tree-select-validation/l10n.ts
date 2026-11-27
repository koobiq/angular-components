import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tree-select-validation example. */
export interface ExampleTranslation {
    placeholder: string;
    valid: string;
    invalid: string;
    none: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        valid: 'Валидный',
        invalid: 'Невалидный',
        none: 'Нет'
    },
    default: {
        placeholder: 'Placeholder',
        valid: 'Valid',
        invalid: 'Invalid',
        none: 'None'
    }
};
