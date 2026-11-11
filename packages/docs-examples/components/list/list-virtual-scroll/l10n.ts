import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the list-virtual-scroll example. */
export interface ExampleText {
    selected: string;
    items: string;
    optionN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        selected: 'Выбрано:',
        items: 'Пункты',
        optionN: (index) => `Вариант №${index}`
    },
    default: {
        selected: 'Selected:',
        items: 'Items',
        optionN: (index) => `Option #${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
