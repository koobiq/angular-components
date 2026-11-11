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
    errorShownOnSubmit: string;
    shouldEnterValue: string;
    invalidEmail: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fieldName: 'Имя поля',
        hintBelowField: 'Подсказка под полем',
        email: 'Эл. почта',
        emailHint: 'Используется для входа и получения уведомлений',
        errorShownOnSubmit: 'Ошибка будет показана, когда поле невалидно и форма отправлена',
        shouldEnterValue: 'Введите значение',
        invalidEmail: 'Некорректная эл. почта'
    },
    default: {
        fieldName: 'Field name',
        hintBelowField: 'Hint below the field',
        email: 'Email',
        emailHint: 'Used to sign in and to receive notifications',
        errorShownOnSubmit: 'Error will be shown when the control is invalid and the form is submitted',
        shouldEnterValue: 'Should enter a value',
        invalidEmail: 'Invalid email'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
