import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-row-group example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    clearCollapsedState: string;
    clearSelectionState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        clearCollapsedState: 'Очистить состояние свёрнутости',
        clearSelectionState: 'Очистить состояние выбора'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        clearCollapsedState: 'Clear collapsed state',
        clearSelectionState: 'Clear selection state'
    }
};
