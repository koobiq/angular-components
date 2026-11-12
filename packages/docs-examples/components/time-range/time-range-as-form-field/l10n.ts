import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleText {
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Период'
    },
    default: {
        placeholder: 'Period'
    }
};
