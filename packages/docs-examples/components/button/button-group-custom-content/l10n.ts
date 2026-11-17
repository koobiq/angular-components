import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-custom-content example. */
export interface ExampleTranslation {
    archive: string;
    report: string;
    snooze: string;
    more: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        archive: 'Архив',
        report: 'Отчёт',
        snooze: 'Отложить',
        more: 'Ещё'
    },
    default: {
        archive: 'Archive',
        report: 'Report',
        snooze: 'Snooze',
        more: 'More'
    }
};
