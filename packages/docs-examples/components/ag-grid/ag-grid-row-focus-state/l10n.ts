import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-row-focus-state example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    resetFocusState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        resetFocusState: 'Сбросить состояние фокуса'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        resetFocusState: 'Reset focus state'
    }
};
