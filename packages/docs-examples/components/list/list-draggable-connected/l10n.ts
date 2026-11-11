import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Metric names of the connected-lists example. */
export interface ExampleText {
    metrics: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        metrics: ['Загрузка ЦП', 'Использование памяти', 'Дисковые операции', 'Сетевой трафик']
    },
    default: {
        metrics: ['CPU load', 'Memory usage', 'Disk I/O', 'Network traffic']
    }
};

/** Metric names of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
