import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the overflow-items examples. */
export interface ExampleText {
    andMore: (count: number) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        andMore: (count) => `и ещё ${count}`
    },
    default: {
        andMore: (count) => `and ${count} more`
    }
};
