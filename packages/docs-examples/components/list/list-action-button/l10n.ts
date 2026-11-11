import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the list-action-button example. */
export interface ExampleText {
    selected: string;
    elements: string;
    longElementName: string;
    badge: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        selected: 'Выбрано:',
        elements: 'Элементы',
        longElementName: 'Элемент с очень очень очень очень очень очень длинным именем',
        badge: 'бейдж'
    },
    default: {
        selected: 'Selected:',
        elements: 'Elements',
        longElementName: 'Element with a very very very very very very long name',
        badge: 'badge'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
