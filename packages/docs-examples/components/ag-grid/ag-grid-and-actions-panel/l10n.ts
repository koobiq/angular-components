import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-and-actions-panel example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    selected: string;
    more: string;
    responsible: string;
    linkToIncident: string;
    remove: string;
    actionInitiated: (action: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        selected: 'Выбрано:',
        more: 'Ещё',
        responsible: 'Ответственный',
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        actionInitiated: (action) => `Действие ${action} инициировано`
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        selected: 'Selected:',
        more: 'More',
        responsible: 'Responsible',
        linkToIncident: 'Link to incident',
        remove: 'Remove',
        actionInitiated: (action) => `Action initiated ${action}`
    }
};
