import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-row-selection-state example. */
export interface ExampleTranslation {
    resetSelectionState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        resetSelectionState: 'Сбросить состояние выбора'
    },
    default: {
        resetSelectionState: 'Reset selection state'
    }
};
