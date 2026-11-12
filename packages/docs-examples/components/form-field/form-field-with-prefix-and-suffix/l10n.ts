import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-prefix-and-suffix example. */
export interface ExampleText {
    search: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        search: 'Поиск'
    },
    default: {
        search: 'Search'
    }
};
