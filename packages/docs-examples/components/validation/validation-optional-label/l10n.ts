import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the validation examples. */
export interface ExampleText {
    name: string;
    lastName: string;
    patronymic: string;
    optional: string;
    submit: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        optional: 'Необязательно',
        submit: 'Отправить'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        patronymic: 'Patronymic',
        optional: 'Optional',
        submit: 'Submit'
    }
};
