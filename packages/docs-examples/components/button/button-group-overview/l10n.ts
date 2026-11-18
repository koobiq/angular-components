import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleTranslation {
    archive: string;
    report: string;
    snooze: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        archive: 'Архив',
        report: 'Отчёт',
        snooze: 'Отложить'
    },
    default: {
        archive: 'Archive',
        report: 'Report',
        snooze: 'Snooze'
    }
};
