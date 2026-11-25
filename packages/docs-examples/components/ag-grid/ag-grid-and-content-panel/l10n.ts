import type { Translations } from '@koobiq/docs-examples/i18n';
import { EXAMPLE_INCIDENT_HEADERS, type ExampleIncidentHeaders } from '../incident-headers';

/** Text of the ag-grid-and-content-panel example. */
export interface ExampleTranslation {
    headers: ExampleIncidentHeaders;
    more: string;
    showExample: string;
    closeWindow: string;
    clickRowHint: string;
    edit: string;
    copy: string;
    delete: string;
    reportBug: string;
    copyLink: string;
    expand: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headers: EXAMPLE_INCIDENT_HEADERS['ru-RU'],
        more: 'Ещё',
        showExample: 'Показать пример',
        closeWindow: 'Закрыть окно',
        clickRowHint: 'Нажмите на строку таблицы, чтобы открыть панель',
        edit: 'Редактировать',
        copy: 'Копировать',
        delete: 'Удалить',
        reportBug: 'Сообщить об ошибке',
        copyLink: 'Копировать ссылку',
        expand: 'Развернуть'
    },
    default: {
        headers: EXAMPLE_INCIDENT_HEADERS.default,
        more: 'More',
        showExample: 'Show example',
        closeWindow: 'Close window',
        clickRowHint: 'Click any table row to open Content panel',
        edit: 'Edit',
        copy: 'Copy',
        delete: 'Delete',
        reportBug: 'Report a bug',
        copyLink: 'Copy link',
        expand: 'Expand'
    }
};
