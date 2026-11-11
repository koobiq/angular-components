import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-message-global-with-links example. */
export interface ExampleText {
    name: string;
    lastName: string;
    patronymic: string;
    number: string;
    series: string;
    optional: string;
    submit: string;
    fillAtLeastOne: string;
    or: string;
    onlyNumbers: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        number: 'Номер',
        series: 'Серия',
        optional: 'Необязательно',
        submit: 'Отправить',
        fillAtLeastOne: 'Заполните хотя бы одно из полей:',
        or: 'или',
        onlyNumbers: 'Только цифры'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        patronymic: 'Patronymic',
        number: 'Number',
        series: 'Series',
        optional: 'Optional',
        submit: 'Submit',
        fillAtLeastOne: 'Fill in at least one of the fields:',
        or: 'or',
        onlyNumbers: 'Only numbers'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
