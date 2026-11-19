import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    settings: string;
    period: string;
    periods: string[];
    workers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        settings: 'Настройки сканирования',
        period: 'Расписание',
        periods: ['Ежедневно', 'Еженедельно', 'Разово'],
        workers: 'Параллельные проверки'
    },
    'en-US': {
        settings: 'Scan settings',
        period: 'Schedule',
        periods: ['Daily', 'Weekly', 'Once'],
        workers: 'Concurrent scans'
    }
};
