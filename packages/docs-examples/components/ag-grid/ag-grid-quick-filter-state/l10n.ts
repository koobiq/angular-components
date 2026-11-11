import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-quick-filter-state example. */
export interface ExampleText {
    text: (index: number) => string;
    column: (index: number) => string;
    quickFilter: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        column: (index) => `Колонка ${index}`,
        quickFilter: 'Быстрый фильтр'
    },
    default: {
        text: (index) => `Text ${index}`,
        column: (index) => `Column ${index}`,
        quickFilter: 'Quick filter'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
