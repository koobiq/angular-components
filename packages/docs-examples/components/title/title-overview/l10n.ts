import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the title-overview example. */
export interface ExampleText {
    justText: string;
    andLongText: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        justText: 'Просто текст',
        andLongText: ' и длинный текст'
    },
    default: {
        justText: 'Just a text',
        andLongText: ' and a long text'
    }
};
