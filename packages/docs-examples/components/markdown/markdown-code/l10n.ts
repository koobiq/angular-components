import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the markdown-code example. */
export interface ExampleText {
    code: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        code: 'Используйте функцию `bypassSecurityTrustHtml()`'
    },
    default: {
        code: 'Use the `bypassSecurityTrustHtml()` function'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
