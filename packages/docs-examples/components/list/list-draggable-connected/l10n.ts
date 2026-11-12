import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Metric names of the connected-lists example. */
export interface ExampleText {
    metrics: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        metrics: ['Загрузка ЦП', 'Использование памяти', 'Дисковые операции', 'Сетевой трафик']
    },
    default: {
        metrics: ['CPU load', 'Memory usage', 'Disk I/O', 'Network traffic']
    }
};
