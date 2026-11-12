import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the button-fill-and-style-only-icon example. */
export interface ExampleText {
    add: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        add: 'Добавить'
    },
    default: {
        add: 'Add'
    }
};
