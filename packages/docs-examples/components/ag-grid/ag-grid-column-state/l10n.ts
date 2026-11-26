import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-column-state example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    resetColumnState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        resetColumnState: 'Сбросить состояние колонок'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        resetColumnState: 'Reset column state'
    }
};
