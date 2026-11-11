import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-hide-with-timeout example. */
export interface ExampleText {
    action: (index: number) => string;
    diamond: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        action: (index) => `Действие ${index}`,
        diamond: 'Ромб'
    },
    default: {
        action: (index) => `Action${index}`,
        diamond: 'Diamond'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
