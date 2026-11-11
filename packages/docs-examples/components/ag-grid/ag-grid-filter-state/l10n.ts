import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-filter-state example. */
export interface ExampleText {
    resetFilterState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        resetFilterState: 'Сбросить состояние фильтров'
    },
    default: {
        resetFilterState: 'Reset filter state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
