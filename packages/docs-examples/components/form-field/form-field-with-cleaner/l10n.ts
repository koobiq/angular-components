import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-field-with-cleaner example. */
export interface ExampleText {
    enterSomeInput: string;
    selectOption: string;
    option: (index: number) => string;
    thisFieldCanBeCleaned: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        enterSomeInput: 'Введите что-нибудь',
        selectOption: 'Выберите вариант',
        option: (index) => `Вариант №${index}`,
        thisFieldCanBeCleaned: 'Это поле можно очистить'
    },
    default: {
        enterSomeInput: 'Enter some input',
        selectOption: 'Select an option',
        option: (index) => `Option #${index}`,
        thisFieldCanBeCleaned: 'This field can be cleaned'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
