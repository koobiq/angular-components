import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-quick-filter-state example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    quickFilter: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        quickFilter: 'Быстрый фильтр'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        quickFilter: 'Quick filter'
    }
};
