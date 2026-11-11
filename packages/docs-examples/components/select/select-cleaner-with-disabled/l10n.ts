import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-cleaner-with-disabled example. */
export interface ExampleText {
    kept: string;
    cleared: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        kept: 'Сохранено',
        cleared: 'Очищено'
    },
    default: {
        kept: 'Kept',
        cleared: 'Cleared'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
