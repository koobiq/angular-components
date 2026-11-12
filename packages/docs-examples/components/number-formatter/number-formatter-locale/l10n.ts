import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the number-formatter examples. Pipe and parameter names (kbqNumber, digitsInfo) stay English as API names. */
export interface ExampleText {
    locale: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        locale: 'Локаль'
    },
    default: {
        locale: 'Locale'
    }
};
