import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the toast-report-overview example. */
export interface ExampleText {
    restore: string;
    report: string;
    perimeterProtection: string;
    deleted: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
