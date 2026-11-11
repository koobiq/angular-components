import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-column-state example. */
export interface ExampleText {
    resetColumnState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        resetColumnState: 'Сбросить состояние колонок'
    },
    default: {
        resetColumnState: 'Reset column state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
