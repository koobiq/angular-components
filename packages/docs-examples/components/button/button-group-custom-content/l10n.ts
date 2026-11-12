import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-custom-content example. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
    more: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
