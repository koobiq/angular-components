import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-column-state example. */
export interface ExampleText {
    text: (index: number) => string;
    column: (index: number) => string;
    resetColumnState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        column: (index) => `Колонка ${index}`,
        resetColumnState: 'Сбросить состояние колонок'
    },
    default: {
        text: (index) => `Text ${index}`,
        column: (index) => `Column ${index}`,
        resetColumnState: 'Reset column state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
