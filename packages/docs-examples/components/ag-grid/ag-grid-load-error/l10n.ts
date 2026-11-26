import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-load-error example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    pinnedColumns: string;
    rowDividers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        pinnedColumns: 'Закреплённые колонки',
        rowDividers: 'Разделители строк'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        pinnedColumns: 'Pinned columns',
        rowDividers: 'Row dividers'
    }
};
