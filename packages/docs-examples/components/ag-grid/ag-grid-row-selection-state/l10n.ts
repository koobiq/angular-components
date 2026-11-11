import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-selection-state example. */
export interface ExampleText {
    text: (index: number) => string;
    column: (index: number) => string;
    resetSelectionState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        column: (index) => `Колонка ${index}`,
        resetSelectionState: 'Сбросить состояние выбора'
    },
    default: {
        text: (index) => `Text ${index}`,
        column: (index) => `Column ${index}`,
        resetSelectionState: 'Reset selection state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
