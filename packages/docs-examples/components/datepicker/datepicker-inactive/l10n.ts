import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleText {
    disabledEmptyField: string;
    readOnlyField: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        disabledEmptyField: 'Отключённое пустое поле',
        readOnlyField: 'Поле только для чтения с данными'
    },
    default: {
        disabledEmptyField: 'Disabled empty field',
        readOnlyField: 'Read-only field with data'
    }
};
