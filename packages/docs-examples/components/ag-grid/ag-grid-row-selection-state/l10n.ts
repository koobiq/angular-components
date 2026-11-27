import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-row-selection-state example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    resetSelectionState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        resetSelectionState: 'Сбросить состояние выбора'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        resetSelectionState: 'Reset selection state'
    }
};
