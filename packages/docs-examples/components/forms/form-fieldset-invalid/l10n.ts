import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the form-fieldset-invalid example. */
export interface ExampleTranslation {
    surname: string;
    name: string;
    patronymic: string;
    errorMessage: (field: string, ordinal: string) => string;
    first: string;
    second: string;
    third: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
