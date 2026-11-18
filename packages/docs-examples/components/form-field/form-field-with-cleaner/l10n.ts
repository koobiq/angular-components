import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-cleaner example. */
export interface ExampleTranslation {
    enterSomeInput: string;
    selectOption: string;
    thisFieldCanBeCleaned: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
