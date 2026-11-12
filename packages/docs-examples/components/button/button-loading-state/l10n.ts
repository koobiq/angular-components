import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleText {
    button: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        button: 'Кнопка'
    },
    default: {
        button: 'Button'
    }
};
