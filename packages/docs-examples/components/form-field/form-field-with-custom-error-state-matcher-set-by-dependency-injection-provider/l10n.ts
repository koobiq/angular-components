import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the form field examples. */
export interface ExampleTranslation {
    email: string;
    errorShownOnSubmit: string;
    shouldEnterValue: string;
    invalidEmail: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        email: 'Эл. почта',
        errorShownOnSubmit: 'Ошибка будет показана, когда поле невалидно и форма отправлена',
        shouldEnterValue: 'Введите значение',
        invalidEmail: 'Некорректная эл. почта'
    },
    default: {
        email: 'Email',
        errorShownOnSubmit: 'Error will be shown when the control is invalid and the form is submitted',
        shouldEnterValue: 'Should enter a value',
        invalidEmail: 'Invalid email'
    }
};
