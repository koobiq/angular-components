import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleText {
    buttonText: string;
    longButtonText: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        buttonText: 'Текст кнопки',
        longButtonText: 'Очень длинный текст кнопки'
    },
    default: {
        buttonText: 'Button text',
        longButtonText: 'Very long button text'
    }
};
