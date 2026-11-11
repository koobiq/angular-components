import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the button-group-content example. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
    diamond: string;
    diamondOptions: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
