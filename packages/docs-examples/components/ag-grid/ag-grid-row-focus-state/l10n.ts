import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-focus-state example. */
export interface ExampleText {
    text: (index: number) => string;
    column: (index: number) => string;
    resetFocusState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        column: (index) => `Колонка ${index}`,
        resetFocusState: 'Сбросить состояние фокуса'
    },
    default: {
        text: (index) => `Text ${index}`,
        column: (index) => `Column ${index}`,
        resetFocusState: 'Reset focus state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
