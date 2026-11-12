import { Translations } from '@koobiq/docs-examples/i18n';

/** Metric names of the connected-lists example. */
export interface ExampleTranslation {
    metrics: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        metrics: ['Загрузка ЦП', 'Использование памяти', 'Дисковые операции', 'Сетевой трафик']
    },
    default: {
        metrics: ['CPU load', 'Memory usage', 'Disk I/O', 'Network traffic']
    }
};
