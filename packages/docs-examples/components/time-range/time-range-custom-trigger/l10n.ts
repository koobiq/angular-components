import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleText {
    trigger: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        trigger: 'триггер периода'
    },
    default: {
        trigger: 'time range trigger'
    }
};
