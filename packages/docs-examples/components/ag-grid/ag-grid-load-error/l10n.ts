import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-load-error example. */
export interface ExampleTranslation {
    headerText: string;
    pinnedColumns: string;
    rowDividers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
