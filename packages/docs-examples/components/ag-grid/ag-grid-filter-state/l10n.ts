import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-filter-state example. */
export interface ExampleText {
    text: (index: number) => string;
    column: (index: number) => string;
    resetFilterState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        column: (index) => `Колонка ${index}`,
        resetFilterState: 'Сбросить состояние фильтров'
    },
    default: {
        text: (index) => `Text ${index}`,
        column: (index) => `Column ${index}`,
        resetFilterState: 'Reset filter state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
