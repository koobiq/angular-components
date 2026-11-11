import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dropdown-lazyload-data example. */
export interface ExampleText {
    someInfo: string;
    value: string;
    dropdownTrigger: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        someInfo: 'Информация',
        value: 'Значение:',
        dropdownTrigger: 'выпадающий список'
    },
    default: {
        someInfo: 'Some info',
        value: 'Value:',
        dropdownTrigger: 'dropdown'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
