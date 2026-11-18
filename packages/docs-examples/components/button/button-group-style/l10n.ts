import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-style example. */
export interface ExampleTranslation {
    archive: string;
    report: string;
    snooze: string;
    diamondIcon: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        archive: 'Архив',
        report: 'Отчёт',
        snooze: 'Отложить',
        diamondIcon: 'Иконка ромба'
    },
    default: {
        archive: 'Archive',
        report: 'Report',
        snooze: 'Snooze',
        diamondIcon: 'Diamond icon'
    }
};
