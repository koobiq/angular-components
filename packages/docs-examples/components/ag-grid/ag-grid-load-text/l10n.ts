import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the load-text example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    loading: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        loading: 'Загрузка...'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        loading: 'Loading...'
    }
};
