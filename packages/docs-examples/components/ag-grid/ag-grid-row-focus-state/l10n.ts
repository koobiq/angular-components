import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-row-focus-state example. */
export interface ExampleText {
    resetFocusState: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        resetFocusState: 'Сбросить состояние фокуса'
    },
    default: {
        resetFocusState: 'Reset focus state'
    }
};
