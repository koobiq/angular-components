import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-load-error example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    pinnedColumns: string;
    rowDividers: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        pinnedColumns: 'Закреплённые колонки',
        rowDividers: 'Разделители строк'
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        pinnedColumns: 'Pinned columns',
        rowDividers: 'Row dividers'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
