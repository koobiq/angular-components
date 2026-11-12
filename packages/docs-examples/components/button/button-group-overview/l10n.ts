import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
