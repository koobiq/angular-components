import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the button-group-custom-content example. */
export interface ExampleText {
    archive: string;
    report: string;
    snooze: string;
    more: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
