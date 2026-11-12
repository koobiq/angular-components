import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleText {
    events: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        events: 'События'
    },
    default: {
        events: 'Events'
    }
};
