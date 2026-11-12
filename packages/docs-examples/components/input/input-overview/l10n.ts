import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the input examples. */
export interface ExampleText {
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер'
    },
    default: {
        placeholder: 'Placeholder'
    }
};
