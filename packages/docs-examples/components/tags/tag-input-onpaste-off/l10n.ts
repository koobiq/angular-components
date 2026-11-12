import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the onpaste-off example. */
export interface ExampleText {
    newTag: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        newTag: 'Новый тег'
    },
    default: {
        newTag: 'New tag'
    }
};
