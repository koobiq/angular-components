import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-content example. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
    diamond: string;
    diamondOptions: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        archive: 'Архив',
        report: 'Отчёт',
        snooze: 'Отложить',
        diamond: 'Ромб',
        diamondOptions: 'Параметры ромба'
    },
    default: {
        archive: 'Archive',
        report: 'Report',
        snooze: 'Snooze',
        diamond: 'Diamond',
        diamondOptions: 'Diamond options'
    }
};
