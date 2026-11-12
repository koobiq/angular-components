import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-column-state example. */
export interface ExampleText {
    resetColumnState: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        resetColumnState: 'Сбросить состояние колонок'
    },
    default: {
        resetColumnState: 'Reset column state'
    }
};
