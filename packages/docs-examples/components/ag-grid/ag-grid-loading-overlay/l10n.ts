import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-loading-overlay example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    showLoadingOverlay: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        showLoadingOverlay: 'Показать оверлей загрузки'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        showLoadingOverlay: 'Show loading overlay'
    }
};
