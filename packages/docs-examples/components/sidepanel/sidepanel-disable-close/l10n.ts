import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidepanel-disable-close example. */
export interface ExampleText {
    sidepanel: string;
    close: string;
    open: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sidepanel: 'Панель',
        close: 'Закрыть',
        open: 'Открыть'
    },
    default: {
        sidepanel: 'Sidepanel',
        close: 'Close',
        open: 'Open'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
