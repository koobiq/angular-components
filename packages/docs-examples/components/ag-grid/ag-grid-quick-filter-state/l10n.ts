import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-quick-filter-state example. */
export interface ExampleText {
    quickFilter: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        quickFilter: 'Быстрый фильтр'
    },
    default: {
        quickFilter: 'Quick filter'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
