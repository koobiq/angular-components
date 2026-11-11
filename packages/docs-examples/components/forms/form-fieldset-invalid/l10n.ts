import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-fieldset-invalid example. */
export interface ExampleText {
    surname: string;
    name: string;
    patronymic: string;
    errorMessage: (field: string, ordinal: string) => string;
    first: string;
    second: string;
    third: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        surname: 'Фамилия',
        name: 'Имя',
        patronymic: 'Отчество',
        errorMessage: (field, ordinal) => `${field}: сообщение об ошибке для ${ordinal} поля`,
        first: 'первого',
        second: 'второго',
        third: 'третьего'
    },
    default: {
        surname: 'Surname',
        name: 'Name',
        patronymic: 'Patronymic',
        errorMessage: (field, ordinal) => `${field}: error message for the ${ordinal} field`,
        first: 'first',
        second: 'second',
        third: 'third'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
