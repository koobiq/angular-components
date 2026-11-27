import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-row-actions example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    rowCopied: (index: number) => string;
    rowArchived: (index: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        rowCopied: (index) => `Строка №${index} скопирована`,
        rowArchived: (index) => `Строка №${index} заархивирована`
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        rowCopied: (index) => `Row #${index} copied`,
        rowArchived: (index) => `Row #${index} archived`
    }
};
