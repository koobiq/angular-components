import { Translations } from '@koobiq/docs-examples/i18n';

/** Metric names of the connected-lists example. */
export interface ExampleTranslation {
    metrics: { id: number; label: string }[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        metrics: [
            { id: 1, label: 'Загрузка ЦП' },
            { id: 2, label: 'Использование памяти' },
            { id: 3, label: 'Дисковые операции' },
            { id: 4, label: 'Сетевой трафик' }
        ]
    },
    default: {
        metrics: [
            { id: 1, label: 'CPU load' },
            { id: 2, label: 'Memory usage' },
            { id: 3, label: 'Disk I/O' },
            { id: 4, label: 'Network traffic' }
        ]
    }
};
