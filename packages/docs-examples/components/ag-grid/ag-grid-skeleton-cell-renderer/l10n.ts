import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the ag-grid examples. */
export interface ExampleText {
    headerText: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        headerText: 'Текст'
    },
    default: {
        headerText: 'Text'
    }
};
