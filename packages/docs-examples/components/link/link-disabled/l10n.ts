import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the link-disabled example. */
export interface ExampleText {
    scanReport: string;
    disabled: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        scanReport: 'Отчёт о сканировании',
        disabled: 'Отключено'
    },
    default: {
        scanReport: 'Scan report',
        disabled: 'Disabled'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
