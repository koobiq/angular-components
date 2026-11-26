import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-filter-state example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    resetFilterState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        resetFilterState: 'Сбросить состояние фильтров'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        resetFilterState: 'Reset filter state'
    }
};
