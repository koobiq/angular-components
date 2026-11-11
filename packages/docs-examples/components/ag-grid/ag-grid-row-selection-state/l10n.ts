import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-selection-state example. */
export interface ExampleText {
    resetSelectionState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        resetSelectionState: 'Сбросить состояние выбора'
    },
    default: {
        resetSelectionState: 'Reset selection state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
