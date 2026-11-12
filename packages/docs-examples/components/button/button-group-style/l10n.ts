import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-style example. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
    diamondIcon: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
