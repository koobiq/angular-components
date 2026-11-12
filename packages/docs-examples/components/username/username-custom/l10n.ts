import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the username examples. Person names and logins stay as proper nouns. */
export interface ExampleText {
    nameFormat: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        nameFormat: 'Формат имени'
    },
    default: {
        nameFormat: 'Name format'
    }
};
