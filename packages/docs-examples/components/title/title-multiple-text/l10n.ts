import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the title examples. */
export interface ExampleText {
    status: string;
    longValueMultiple: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        status: 'Статус',
        longValueMultiple: 'Длинное значение, которое не помещается и обрезается многоточием'
    },
    default: {
        status: 'Status',
        longValueMultiple: 'A long value that does not fit and is truncated with an ellipsis'
    }
};
