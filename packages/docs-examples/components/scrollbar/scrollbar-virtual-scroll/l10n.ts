import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the scrollbar examples. */
export interface ExampleText {
    addItems: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        addItems: 'Добавить элементы'
    },
    default: {
        addItems: 'Add items'
    }
};
