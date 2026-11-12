import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-hide-with-timeout example. */
export interface ExampleText {
    diamond: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        diamond: 'Ромб'
    },
    default: {
        diamond: 'Diamond'
    }
};
