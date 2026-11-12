import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the timepicker examples. */
export interface ExampleText {
    onlyNumbers: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        onlyNumbers: 'Только цифры'
    },
    default: {
        onlyNumbers: 'Only numbers'
    }
};
