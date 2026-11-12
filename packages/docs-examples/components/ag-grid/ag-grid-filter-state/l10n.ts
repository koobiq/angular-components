import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-filter-state example. */
export interface ExampleTranslation {
    resetFilterState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        resetFilterState: 'Сбросить состояние фильтров'
    },
    default: {
        resetFilterState: 'Reset filter state'
    }
};
