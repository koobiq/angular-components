import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-quick-filter-state example. */
export interface ExampleTranslation {
    quickFilter: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        quickFilter: 'Быстрый фильтр'
    },
    default: {
        quickFilter: 'Quick filter'
    }
};
