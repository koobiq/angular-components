import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-vertical example. */
export interface ExampleText {
    minus: string;
    plus: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        minus: 'Минус',
        plus: 'Плюс'
    },
    default: {
        minus: 'Minus',
        plus: 'Plus'
    }
};
