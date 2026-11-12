import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the timepicker examples. */
export interface ExampleText {
    required: string;
    minIs: (time: string) => string;
    maxIs: (time: string) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        required: 'Обязательно',
        minIs: (time) => `Минимум ${time}`,
        maxIs: (time) => `Максимум ${time}`
    },
    default: {
        required: 'Required',
        minIs: (time) => `Min is ${time}`,
        maxIs: (time) => `Maximum is ${time}`
    }
};
