import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the list-virtual-scroll example. */
export interface ExampleText {
    selected: string;
    items: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        selected: 'Выбрано:',
        items: 'Пункты'
    },
    default: {
        selected: 'Selected:',
        items: 'Items'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
