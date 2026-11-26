import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-status-bar example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    selected: string;
    totalRows: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        selected: 'Выбрано:',
        totalRows: 'Всего строк:'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        selected: 'Selected:',
        totalRows: 'Total rows:'
    }
};
