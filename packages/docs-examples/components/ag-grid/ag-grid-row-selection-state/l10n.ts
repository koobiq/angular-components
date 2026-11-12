import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-row-selection-state example. */
export interface ExampleText {
    resetSelectionState: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        resetSelectionState: 'Сбросить состояние выбора'
    },
    default: {
        resetSelectionState: 'Reset selection state'
    }
};
