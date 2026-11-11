import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the form field examples. */
export interface ExampleText {
    fieldName: string;
    hintBelowField: string;
    email: string;
    emailHint: string;
    password: string;
    minLength: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
    shouldEnterPassword: string;
    enterSomeInput: string;
    selectOption: string;
    option: (index: number) => string;
    thisFieldCanBeCleaned: string;
    errorShownOnSubmit: string;
    shouldEnterValue: string;
    invalidEmail: string;
    enterEmail: string;
    articleTitle: string;
    maxChars: (max: number, count: number) => string;
    label: string;
    clickLabelForFocus: string;
    search: string;
    formFieldWithoutBorders: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fieldName: 'Имя поля',
        hintBelowField: 'Подсказка под полем',
        email: 'Эл. почта',
        emailHint: 'Используется для входа и получения уведомлений',
        password: 'Пароль',
        minLength: 'Минимальная длина',
        uppercase: 'Заглавные буквы',
        lowercase: 'Строчные буквы',
        number: 'Цифры',
        special: 'Специальные символы',
        shouldEnterPassword: 'Введите пароль',
        enterSomeInput: 'Введите что-нибудь',
        selectOption: 'Выберите вариант',
        option: (index) => `Вариант №${index}`,
        thisFieldCanBeCleaned: 'Это поле можно очистить',
        errorShownOnSubmit: 'Ошибка будет показана, когда поле невалидно и форма отправлена',
        shouldEnterValue: 'Введите значение',
        invalidEmail: 'Некорректная эл. почта',
        enterEmail: 'Введите эл. почту',
        articleTitle: 'Заголовок статьи',
        maxChars: (max, count) => `Максимум ${max} символов (${count}/${max})`,
        label: 'Метка',
        clickLabelForFocus: 'Нажмите на метку для автофокуса',
        search: 'Поиск',
        formFieldWithoutBorders: 'Поле без границ'
    },
    default: {
        fieldName: 'Field name',
        hintBelowField: 'Hint below the field',
        email: 'Email',
        emailHint: 'Used to sign in and to receive notifications',
        password: 'Password',
        minLength: 'Min length',
        uppercase: 'Uppercase characters',
        lowercase: 'Lowercase characters',
        number: 'Number characters',
        special: 'Special characters',
        shouldEnterPassword: 'Should enter password',
        enterSomeInput: 'Enter some input',
        selectOption: 'Select an option',
        option: (index) => `Option #${index}`,
        thisFieldCanBeCleaned: 'This field can be cleaned',
        errorShownOnSubmit: 'Error will be shown when the control is invalid and the form is submitted',
        shouldEnterValue: 'Should enter a value',
        invalidEmail: 'Invalid email',
        enterEmail: 'Enter email',
        articleTitle: 'Article title',
        maxChars: (max, count) => `Max ${max} chars (${count}/${max})`,
        label: 'Label',
        clickLabelForFocus: 'Click on the label for auto focus',
        search: 'Search',
        formFieldWithoutBorders: 'Form field without borders'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
