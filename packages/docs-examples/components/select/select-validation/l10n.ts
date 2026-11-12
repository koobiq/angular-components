import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-validation example. */
export interface ExampleText {
    placeholder: string;
    invalid: string;
    none: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
