import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-row-focus-state example. */
export interface ExampleTranslation {
    resetFocusState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        resetFocusState: 'Сбросить состояние фокуса'
    },
    default: {
        resetFocusState: 'Reset focus state'
    }
};
