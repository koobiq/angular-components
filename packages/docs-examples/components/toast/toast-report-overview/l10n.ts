import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-report-overview example. */
export interface ExampleText {
    restore: string;
    report: string;
    perimeterProtection: string;
    deleted: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
