import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the toggle examples. */
export interface ExampleText {
    vibration: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        vibration: 'Вибрация'
    },
    default: {
        vibration: 'Vibration'
    }
};
