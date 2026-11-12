import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleText {
    filled: string;
    showAll: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        filled: 'Заливка',
        showAll: 'Показать всё'
    },
    default: {
        filled: 'Filled',
        showAll: 'Show all'
    }
};
