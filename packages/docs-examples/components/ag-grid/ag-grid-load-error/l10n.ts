import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-load-error example. */
export interface ExampleText {
    headerText: string;
    pinnedColumns: string;
    rowDividers: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        headerText: 'Текст',
        pinnedColumns: 'Закреплённые колонки',
        rowDividers: 'Разделители строк'
    },
    default: {
        headerText: 'Text',
        pinnedColumns: 'Pinned columns',
        rowDividers: 'Row dividers'
    }
};
