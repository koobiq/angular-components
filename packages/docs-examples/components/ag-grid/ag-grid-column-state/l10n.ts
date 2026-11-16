import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-column-state example. */
export interface ExampleTranslation {
    resetColumnState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        resetColumnState: 'Сбросить состояние колонок'
    },
    default: {
        resetColumnState: 'Reset column state'
    }
};
