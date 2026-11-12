import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleText {
    lineBreak: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        lineBreak: `Первая строка  
Вторая строка`
    },
    default: {
        lineBreak: `First line  
Second line`
    }
};
