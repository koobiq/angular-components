import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-unfilled example. */
export interface ExampleText {
    empty: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        empty: 'Пусто'
    },
    default: {
        empty: 'Empty'
    }
};
