import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleText {
    lineNumbers: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        lineNumbers: 'Нумерация строк'
    },
    default: {
        lineNumbers: 'Line numbers'
    }
};
