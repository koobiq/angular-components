import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-cleaner example. */
export interface ExampleText {
    enterSomeInput: string;
    selectOption: string;
    thisFieldCanBeCleaned: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        enterSomeInput: 'Введите что-нибудь',
        selectOption: 'Выберите вариант',
        thisFieldCanBeCleaned: 'Это поле можно очистить'
    },
    default: {
        enterSomeInput: 'Enter some input',
        selectOption: 'Select an option',
        thisFieldCanBeCleaned: 'This field can be cleaned'
    }
};
