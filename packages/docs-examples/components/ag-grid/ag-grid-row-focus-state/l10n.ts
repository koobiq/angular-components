import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-focus-state example. */
export interface ExampleText {
    resetFocusState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        resetFocusState: 'Сбросить состояние фокуса'
    },
    default: {
        resetFocusState: 'Reset focus state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
