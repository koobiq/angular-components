import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-message-global-with-links example. */
export interface ExampleTranslation {
    name: string;
    lastName: string;
    patronymic: string;
    optional: string;
    submit: string;
    number: string;
    series: string;
    fillAtLeastOne: string;
    or: string;
    onlyNumbers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        optional: 'Необязательно',
        submit: 'Отправить',
        number: 'Номер',
        series: 'Серия',
        fillAtLeastOne: 'Заполните хотя бы одно из полей:',
        or: 'или',
        onlyNumbers: 'Только цифры'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        patronymic: 'Patronymic',
        optional: 'Optional',
        submit: 'Submit',
        number: 'Number',
        series: 'Series',
        fillAtLeastOne: 'Fill in at least one of the fields:',
        or: 'or',
        onlyNumbers: 'Only numbers'
    }
};
