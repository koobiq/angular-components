import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the horizontal-form-labels example. */
export interface ExampleText {
    customFraction: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        customFraction: 'Произвольная (напр., 1/3 от ширины)'
    },
    default: {
        customFraction: 'Custom (e.g. 1/3 cols)'
    }
};
