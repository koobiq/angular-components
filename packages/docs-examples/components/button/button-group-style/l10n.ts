import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the button-group-style example. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
    diamondIcon: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
