import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-in-sidepanel example. */
export interface ExampleText {
    openSidepanel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        openSidepanel: 'Открыть панель'
    },
    default: {
        openSidepanel: 'Open sidepanel'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
