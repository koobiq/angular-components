import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-export example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    download: (format: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        download: (format) => `Скачать ${format}`
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        download: (format) => `Download ${format}`
    }
};
