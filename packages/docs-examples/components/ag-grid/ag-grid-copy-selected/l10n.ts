import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-copy-selected example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    dataCopied: string;
    dataCopiedCaption: (format: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        dataCopied: 'Данные скопированы',
        dataCopiedCaption: (format) => `Выбранные строки скопированы в буфер обмена. Формат: ${format}`
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        dataCopied: 'Data copied',
        dataCopiedCaption: (format) => `Selected nodes have been copied to clipboard. Format: ${format}`
    }
};
