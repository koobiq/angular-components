import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-field-without-borders example. */
export interface ExampleText {
    shouldEnterValue: string;
    formFieldWithoutBorders: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        shouldEnterValue: 'Введите значение',
        formFieldWithoutBorders: 'Поле без границ'
    },
    default: {
        shouldEnterValue: 'Should enter a value',
        formFieldWithoutBorders: 'Form field without borders'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
