import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text shown by the ag-grid examples. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU']
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default
    }
};
