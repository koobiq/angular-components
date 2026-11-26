import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the row-detail example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    expandMultipleRows: string;
    fillExpandedRows: string;
    collapse: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        expandMultipleRows: 'Раскрывать несколько строк',
        fillExpandedRows: 'Заполнять раскрытые строки',
        collapse: 'Свернуть'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        expandMultipleRows: 'Expand multiple rows',
        fillExpandedRows: 'Fill expanded rows',
        collapse: 'Collapse'
    }
};
