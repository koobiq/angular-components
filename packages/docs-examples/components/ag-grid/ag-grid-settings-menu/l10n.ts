import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-settings-menu example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    density: string;
    compact: string;
    normal: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        density: 'Плотность',
        compact: 'Компактно',
        normal: 'Обычно'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        density: 'Density',
        compact: 'Compact',
        normal: 'Normal'
    }
};
