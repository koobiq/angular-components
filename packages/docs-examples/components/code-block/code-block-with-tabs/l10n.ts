import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleText {
    lineNumbers: string;
    filled: string;
    hideTabs: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        lineNumbers: 'Нумерация строк',
        filled: 'Заливка',
        hideTabs: 'Скрыть вкладки'
    },
    default: {
        lineNumbers: 'Line numbers',
        filled: 'Filled',
        hideTabs: 'Hide tabs'
    }
};
