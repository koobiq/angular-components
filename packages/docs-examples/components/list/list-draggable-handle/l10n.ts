import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Fruit names of the drag-handle example. */
export interface ExampleText {
    fruits: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fruits: ['Банан', 'Вишня', 'Грейпфрут', 'Манго']
    },
    default: {
        fruits: ['Banana', 'Cherry', 'Grapefruit', 'Mango']
    }
};

/** Fruit names of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
