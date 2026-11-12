import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the toast-report-overview example. */
export interface ExampleTranslation {
    restore: string;
    report: string;
    perimeterProtection: string;
    deleted: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        restore: 'Восстановить',
        report: 'Отчет',
        perimeterProtection: 'Защита периметра',
        deleted: 'удален'
    },
    default: {
        restore: 'Restore',
        report: 'Report',
        perimeterProtection: 'Perimeter protection',
        deleted: 'deleted'
    }
};
