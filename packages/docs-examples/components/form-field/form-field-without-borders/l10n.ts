import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-without-borders example. */
export interface ExampleText {
    shouldEnterValue: string;
    formFieldWithoutBorders: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        shouldEnterValue: 'Введите значение',
        formFieldWithoutBorders: 'Поле без границ'
    },
    default: {
        shouldEnterValue: 'Should enter a value',
        formFieldWithoutBorders: 'Form field without borders'
    }
};
